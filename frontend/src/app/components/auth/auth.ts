import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GymService } from '../../services/gym.service';
import { User } from '../../models/user';
import { Gym } from '../../models/gym';
import * as L from 'leaflet';
import { finalize, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css'
})
export class Auth implements OnInit, AfterViewChecked, OnDestroy {
  isLogin = true;
  selectedRole: string = 'MEMBER';
  step = 1; // 1 = account info, 2 = gym info (owner only)

  // User fields
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  phone = '';
  showPassword = false;
  showConfirmPassword = false;
  memberAddress = '';

  // Gym fields (owner only)
  gymName = '';
  gymAddress = '';
  gymCity = '';
  gymPhone = '';
  gymDescription = '';
  gymPrice = 0;
  gymSchedule = [
    { day: 'Lundi', open: true, from: '06:00', to: '22:00' },
    { day: 'Mardi', open: true, from: '06:00', to: '22:00' },
    { day: 'Mercredi', open: true, from: '06:00', to: '22:00' },
    { day: 'Jeudi', open: true, from: '06:00', to: '22:00' },
    { day: 'Vendredi', open: true, from: '06:00', to: '22:00' },
    { day: 'Samedi', open: true, from: '08:00', to: '20:00' },
    { day: 'Dimanche', open: false, from: '08:00', to: '18:00' }
  ];
  gymAmenities = '';
  amenitiesList: string[] = [];
  amenityInput = '';
  gymLat = 36.8065; // Default: Tunis
  gymLng = 10.1815;

  // Gym picture (Owner only)
  gymImage: string | null = null;
  gymImagePreview: string | null = null;

  error = '';
  loading = false;

  roles = [
    { value: 'MEMBER', label: 'Athlete', desc: "S'entrainer et suivre" },
    { value: 'OWNER', label: 'Proprietaire de salle', desc: 'Gerer et developper' },
    { value: 'COACH', label: 'Coach', desc: 'Entrainer et inspirer' }
  ];

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private mapInitialized = false;
  private needsMapInit = false;

  constructor(
    private authService: AuthService,
    private gymService: GymService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.redirectByRole(this.authService.getRole()!);
      return;
    }
    this.route.queryParams.subscribe(params => {
      if (params['role']) {
        this.selectedRole = params['role'];
        this.isLogin = false;
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.needsMapInit && !this.mapInitialized) {
      const container = document.getElementById('gym-map');
      if (container) {
        this.initMap();
        this.needsMapInit = false;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  toggleMode(): void {
    this.isLogin = !this.isLogin;
    this.step = 1;
    this.error = '';
  }

  selectRole(role: string): void {
    this.selectedRole = role;
    this.error = '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  addAmenity(): void {
    const val = this.amenityInput.trim();
    if (val && !this.amenitiesList.includes(val)) {
      this.amenitiesList.push(val);
    }
    this.amenityInput = '';
  }

  removeAmenity(index: number): void {
    this.amenitiesList.splice(index, 1);
  }

  onGymImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.error = 'Veuillez selectionner un fichier image valide';
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'La taille de l\'image doit etre inferieure a 5 Mo';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.gymImage = e.target?.result as string;
        this.gymImagePreview = this.gymImage;
      };
      reader.readAsDataURL(file);
    }
  }

  removeGymImage(): void {
    this.gymImage = null;
    this.gymImagePreview = null;
  }

  nextStep(): void {
    this.error = '';
    if (!this.name || !this.email || !this.password || !this.phone) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }
    if (!/^\d{8}$/.test(this.phone)) {
      this.error = 'Le numero de telephone doit contenir exactement 8 chiffres.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caracteres.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }
    this.step = 2;
    this.needsMapInit = true;
    this.mapInitialized = false;
  }

  prevStep(): void {
    this.step = 1;
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.mapInitialized = false;
    }
  }

  onSubmit(): void {
    console.log('onSubmit called, isLogin:', this.isLogin, 'email:', this.email);
    this.error = '';

    if (this.isLogin) {
      if (!this.email || !this.password) {
        this.error = 'Veuillez remplir tous les champs';
        return;
      }
      this.loading = true;
      console.log('Calling authService.login...');
      this.authService.login(this.email, this.password).subscribe({
        next: (user) => {
          this.loading = false;
          this.redirectByRole(user.role);
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || err?.message || 'Email ou mot de passe incorrect';
        }
      });
    } else {
      // Registration
      if (this.selectedRole === 'OWNER' && this.step === 1) {
        this.nextStep();
        return;
      }

      if (this.selectedRole === 'OWNER' && !this.gymName) {
        this.error = 'Veuillez saisir le nom de la salle';
        return;
      }
      if (this.selectedRole === 'OWNER' && !this.gymAddress) {
        this.error = 'Veuillez saisir l\'adresse de la salle';
        return;
      }

      // Validate basic fields for non-owner (they don't go through step 2)
      if (this.selectedRole !== 'OWNER') {
        if (!this.name || !this.email || !this.password || !this.phone) {
          this.error = 'Veuillez remplir tous les champs obligatoires';
          return;
        }
        if (!/^\d{8}$/.test(this.phone)) {
          this.error = 'Le numero de telephone doit contenir exactement 8 chiffres.';
          return;
        }
        if (this.password.length < 6) {
          this.error = 'Le mot de passe doit contenir au moins 6 caracteres.';
          return;
        }
        if (this.password !== this.confirmPassword) {
          this.error = 'Les mots de passe ne correspondent pas.';
          return;
        }
      }

      this.loading = true;
      const user: User = {
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.selectedRole as 'MEMBER' | 'OWNER' | 'COACH',
        phone: this.phone,
        address: this.selectedRole === 'MEMBER' && this.memberAddress ? this.memberAddress : undefined
      };

      this.authService.register(user).pipe(
        finalize(() => {
          // For non-owners, finalize here. Owners finalize after gym creation.
          if (this.selectedRole !== 'OWNER') {
            this.loading = false;
          }
        })
      ).subscribe({
        next: (u) => {
          if (this.selectedRole === 'OWNER') {
            // Create gym after user registration
            this.createGymForOwner(u);
          } else {
            this.redirectByRole(u.role);
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || "L'inscription a echoue. L'email est peut-etre deja utilise.";
        }
      });
    }
  }

  private buildOpeningHours(): string {
    return this.gymSchedule
      .filter(d => d.open)
      .map(d => `${d.day}: ${d.from} - ${d.to}`)
      .join(', ');
  }

  private createGymForOwner(owner: User): void {
    const gym: Gym = {
      name: this.gymName,
      address: this.gymAddress,
      description: this.gymDescription || undefined,
      city: this.gymCity || undefined,
      phone: this.gymPhone || undefined,
      ownerId: owner.id!,
      ownerName: owner.name,
      monthlyPrice: this.gymPrice || undefined,
      openingHours: this.buildOpeningHours() || undefined,
      amenities: this.amenitiesList.length > 0 ? this.amenitiesList : undefined,
      image: this.gymImage || undefined,
      latitude: this.gymLat,
      longitude: this.gymLng,
      isActive: true,
      rating: 0,
      memberCount: 0
    };

    console.log('Creating gym:', gym);

    this.gymService.create(gym).pipe(
      timeout(15000),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (savedGym) => {
        console.log('Gym created successfully:', savedGym);
        this.redirectByRole('OWNER');
      },
      error: (err) => {
        console.error('Gym creation error:', err);
        // User was created but gym failed - still redirect, they can create gym later
        this.redirectByRole('OWNER');
      }
    });
  }

  private initMap(): void {
    if (this.mapInitialized) return;

    // Fix Leaflet default icon path issue
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.map = L.map('gym-map', {
      center: [this.gymLat, this.gymLng],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([this.gymLat, this.gymLng], { icon: iconDefault, draggable: true }).addTo(this.map);

    // Click on map to move marker
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.gymLat = parseFloat(e.latlng.lat.toFixed(6));
      this.gymLng = parseFloat(e.latlng.lng.toFixed(6));
      this.marker?.setLatLng(e.latlng);
      this.reverseGeocode(this.gymLat, this.gymLng);
    });

    // Drag marker
    this.marker.on('dragend', () => {
      const pos = this.marker!.getLatLng();
      this.gymLat = parseFloat(pos.lat.toFixed(6));
      this.gymLng = parseFloat(pos.lng.toFixed(6));
      this.reverseGeocode(this.gymLat, this.gymLng);
    });

    this.mapInitialized = true;

    // Fix map size after render
    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  searchAddress(): void {
    const query = this.gymAddress || this.gymCity;
    if (!query) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
      .then(r => r.json())
      .then(results => {
        if (results.length > 0) {
          const { lat, lon, display_name } = results[0];
          this.gymLat = parseFloat(parseFloat(lat).toFixed(6));
          this.gymLng = parseFloat(parseFloat(lon).toFixed(6));
          const latlng = L.latLng(this.gymLat, this.gymLng);
          this.marker?.setLatLng(latlng);
          this.map?.setView(latlng, 15);
        }
      })
      .catch(() => {});
  }

  private reverseGeocode(lat: number, lng: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(r => r.json())
      .then(result => {
        if (result.address) {
          const a = result.address;
          this.gymAddress = result.display_name?.split(',').slice(0, 3).join(',').trim() || this.gymAddress;
          this.gymCity = a.city || a.town || a.village || a.state || this.gymCity;
        }
      })
      .catch(() => {});
  }

  private redirectByRole(role: string): void {
    console.log('redirectByRole called with role:', role);
    switch (role) {
      case 'MEMBER': this.router.navigate(['/member']); break;
      case 'OWNER': this.router.navigate(['/owner']); break;
      case 'COACH': this.router.navigate(['/coach']); break;
      default: this.router.navigate(['/']);
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
