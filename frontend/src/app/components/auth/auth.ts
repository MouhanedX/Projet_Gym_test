import { Component, OnInit, AfterViewChecked, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GymService } from '../../services/gym.service';
import { User } from '../../models/user';
import { Gym } from '../../models/gym';
import * as L from 'leaflet';
import { finalize } from 'rxjs/operators';

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

  // Gym fields (owner only)
  gymName = '';
  gymAddress = '';
  gymCity = '';
  gymPhone = '';
  gymDescription = '';
  gymPrice = 0;
  gymOpeningHours = '06:00 - 22:00';
  gymAmenities = '';
  gymImage = ''; // Optional image path
  gymLat = 36.8065; // Default: Tunis
  gymLng = 10.1815;

  error = '';
  loading = false;

  roles = [
    { value: 'MEMBER', label: 'Gym Rat', icon: '🏃', desc: 'Train & Track' },
    { value: 'OWNER', label: 'Gym Owner', icon: '🏢', desc: 'Manage & Grow' },
    { value: 'COACH', label: 'Coach', icon: '🏅', desc: 'Train & Inspire' }
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
  }

  nextStep(): void {
    this.error = '';
    if (!this.name || !this.email || !this.password) {
      this.error = 'Please fill in all required fields';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
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
        this.error = 'Please fill in all fields';
        return;
      }
      this.loading = true;
      console.log('Calling authService.login...');
      this.authService.login(this.email, this.password).pipe(
        finalize(() => this.loading = false)
      ).subscribe({
        next: (user) => {
          console.log('Login success, user:', user);
          this.redirectByRole(user.role);
        },
        error: (err) => {
          console.error('Login error:', err);
          this.error = err.error?.message || 'Invalid email or password';
        }
      });
    } else {
      // Registration
      if (this.selectedRole === 'OWNER' && this.step === 1) {
        this.nextStep();
        return;
      }

      if (this.selectedRole === 'OWNER' && !this.gymName) {
        this.error = 'Please enter your gym name';
        return;
      }
      if (this.selectedRole === 'OWNER' && !this.gymAddress) {
        this.error = 'Please enter your gym address';
        return;
      }

      // Validate basic fields for non-owner (they don't go through step 2)
      if (this.selectedRole !== 'OWNER') {
        if (!this.name || !this.email || !this.password) {
          this.error = 'Please fill in all required fields';
          return;
        }
        if (this.password !== this.confirmPassword) {
          this.error = 'Passwords do not match';
          return;
        }
        if (this.password.length < 6) {
          this.error = 'Password must be at least 6 characters';
          return;
        }
      }

      this.loading = true;
      const user: User = {
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.selectedRole as 'MEMBER' | 'OWNER' | 'COACH',
        phone: this.phone || undefined
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
          this.error = err.error?.message || 'Registration failed. Email may already be in use.';
        }
      });
    }
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
      image: this.gymImage || undefined,
      monthlyPrice: this.gymPrice || undefined,
      openingHours: this.gymOpeningHours || undefined,
      amenities: this.gymAmenities ? this.gymAmenities.split(',').map(a => a.trim()).filter(a => a) : undefined,
      latitude: this.gymLat,
      longitude: this.gymLng,
      isActive: true,
      rating: 0,
      memberCount: 0
    };

    console.log('Creating gym:', gym);

    this.gymService.create(gym).pipe(
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
