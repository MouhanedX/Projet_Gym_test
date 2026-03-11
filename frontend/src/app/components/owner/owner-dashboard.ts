import { Component, OnInit, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GymService } from '../../services/gym.service';
import { ProgramService } from '../../services/program.service';
import { BookingService } from '../../services/booking.service';
import { UserService } from '../../services/user.service';
import { InscriptionService } from '../../services/inscription.service';
import { PaiementService } from '../../services/paiement.service';
import { User } from '../../models/user';
import { Gym } from '../../models/gym';
import { Program } from '../../models/program';
import { Booking } from '../../models/booking';
import { Inscription } from '../../models/inscription';
import { Paiement } from '../../models/paiement';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.css'
})
export class OwnerDashboard implements OnInit {
  user: User | null = null;
  activeTab = 'overview';
  gym: Gym | null = null;
  programs: Program[] = [];
  bookings: Booking[] = [];
  coaches: User[] = [];
  inscriptions: Inscription[] = [];
  paiements: Paiement[] = [];
  loading = true;
  darkMode = false;
  bookingFilter = '';
  inscriptionFilter = '';

  revenueChart = [
    { month: 'Sept', value: '8k', height: 110 },
    { month: 'Oct', value: '9k', height: 125 },
    { month: 'Nov', value: '10k', height: 140 },
    { month: 'Déc', value: '11.5k', height: 158 },
    { month: 'Jan', value: '11.8k', height: 162 },
    { month: 'Fév', value: '12.4k', height: 170 },
  ];

  subscriberFilter = '';

  // Gym form
  showGymForm = false;
  gymName = '';
  gymDescription = '';
  gymAddress = '';
  gymCity = '';
  gymPhone = '';
  gymPrice = 0;
  gymOpeningHours = '06:00 - 22:00';
  gymDisplaySchedule: { day: string; open: string; close: string; closed: boolean }[] = [];
  gymSchedule: { day: string; open: string; close: string; closed: boolean }[] = [
    { day: 'Lundi',    open: '06:00', close: '22:00', closed: false },
    { day: 'Mardi',    open: '06:00', close: '22:00', closed: false },
    { day: 'Mercredi', open: '06:00', close: '22:00', closed: false },
    { day: 'Jeudi',    open: '06:00', close: '22:00', closed: false },
    { day: 'Vendredi', open: '06:00', close: '22:00', closed: false },
    { day: 'Samedi',   open: '08:00', close: '20:00', closed: false },
    { day: 'Dimanche', open: '08:00', close: '18:00', closed: true  }
  ];
  gymAmenityInput = '';
  gymAmenitiesList: string[] = [];
  gymImage: string | null = null;
  gymImagePreview: string | null = null;
  gymLat: number | null = null;
  gymLng: number | null = null;
  gettingLocation = false;

  // Program form
  showProgramForm = false;
  editingProgram: Program | null = null;
  progTitle = '';
  progDescription = '';
  progType = 'STRENGTH';
  progDifficulty = 'BEGINNER';
  progCoachId = '';
  progDays: string[] = [];
  progStartTime = '08:00';
  progEndTime = '09:00';
  progCapacity = 20;
  progPrice = 0;
  progSubmitAttempted = false;
  progError = '';
  openDropdown: string | null = null;
  readonly typeLabels: Record<string, string> = {
    STRENGTH: 'Musculation', CARDIO: 'Cardio', YOGA: 'Yoga',
    HIIT: 'HIIT', CROSSFIT: 'CrossFit', BOXING: 'Boxe',
    SWIMMING: 'Natation', MARTIAL_ARTS: 'Arts martiaux'
  };
  readonly diffLabels: Record<string, string> = {
    BEGINNER: 'Débutant', INTERMEDIATE: 'Intermédiaire', ADVANCED: 'Avancé'
  };

  tabs = [
    { key: 'overview', label: 'Dashboard', icon: '📊' },
    { key: 'gym', label: 'Ma Salle', icon: '🏢' },
    { key: 'programs', label: 'Programmes', icon: '🎯' },
    { key: 'bookings', label: 'Réservations', icon: '📅' },
    { key: 'inscriptions', label: 'Inscriptions', icon: '👥' },
    { key: 'coaches', label: 'Coachs', icon: '🏅' }
  ];

  programTypes = ['STRENGTH', 'CARDIO', 'YOGA', 'HIIT', 'CROSSFIT', 'BOXING', 'SWIMMING', 'MARTIAL_ARTS'];
  difficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  constructor(
    private authService: AuthService,
    private gymService: GymService,
    private programService: ProgramService,
    private bookingService: BookingService,
    private userService: UserService,
    private inscriptionService: InscriptionService,
    private paiementService: PaiementService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    if (this.user?.id) {
      this.gymService.getByOwner(this.user.id).subscribe({
        next: (gyms) => {
          this.gym = gyms.length > 0 ? gyms[0] : null;
          this.gymDisplaySchedule = this.parseScheduleString(this.gym?.openingHours || '');
          if (this.gym?.id) {
            this.programService.getByGym(this.gym.id).subscribe({ next: p => this.programs = p });
            this.bookingService.getByGym(this.gym.id).subscribe({ next: b => this.bookings = b });
            this.userService.getCoachesByGym(this.gym.id).subscribe({ next: c => this.coaches = c });
            this.inscriptionService.getBySalle(this.gym.id).subscribe({ next: i => this.inscriptions = i, error: () => {} });
            this.paiementService.getBySalle(this.gym.id).subscribe({ next: p => this.paiements = p, error: () => {} });
          }
          this.loading = false;
        },
        error: () => { this.loading = false; }
      });
    }
    this.userService.getCoaches().subscribe({ next: c => { if (!this.gym) this.coaches = c; } });
  }

  setTab(tab: string): void { this.activeTab = tab; }

  toggleDark(): void {
    this.darkMode = !this.darkMode;
    document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
  }

  // === GYM METHODS ===
  saveGym(): void {
    const gymData: Gym = {
      name: this.gymName,
      description: this.gymDescription,
      address: this.gymAddress,
      city: this.gymCity,
      phone: this.gymPhone,
      ownerId: this.user!.id!,
      ownerName: this.user!.name,
      monthlyPrice: this.gymPrice,
      openingHours: this.buildScheduleString(),
      amenities: this.gymAmenitiesList,
      image: this.gymImage || undefined,
      latitude: this.gymLat || undefined,
      longitude: this.gymLng || undefined
    };

    if (this.gym?.id) {
      this.gymService.update(this.gym.id, gymData).subscribe({
        next: (updated) => { this.gym = updated; this.showGymForm = false; this.loadData(); },
        error: (err) => { console.error('Update failed:', err); alert('Erreur lors de la mise à jour'); }
      });
    } else {
      this.gymService.create(gymData).subscribe({
        next: (created) => { this.gym = created; this.showGymForm = false; this.loadData(); },
        error: (err) => { console.error('Create failed:', err); alert('Erreur lors de la création'); }
      });
    }
  }

  editGym(): void {
    if (this.gym) {
      this.gymName = this.gym.name;
      this.gymDescription = this.gym.description || '';
      this.gymAddress = this.gym.address;
      this.gymCity = this.gym.city || '';
      this.gymPhone = this.gym.phone || '';
      this.gymPrice = this.gym.monthlyPrice || 0;
      this.gymOpeningHours = this.gym.openingHours || '';
      this.parseSchedule(this.gym.openingHours || '');
      this.gymAmenitiesList = [...(this.gym.amenities || [])];
      this.gymAmenityInput = '';
      this.gymImage = this.gym.image || null;
      this.gymImagePreview = this.gym.image || null;
      this.gymLat = this.gym.latitude || null;
      this.gymLng = this.gym.longitude || null;
    }
    this.showGymForm = true;
  }

  addGymAmenity(): void {
    const val = this.gymAmenityInput.trim();
    if (val && !this.gymAmenitiesList.includes(val)) {
      this.gymAmenitiesList.push(val);
    }
    this.gymAmenityInput = '';
  }

  removeGymAmenity(index: number): void {
    this.gymAmenitiesList.splice(index, 1);
  }

  private parseScheduleString(hours: string): { day: string; open: string; close: string; closed: boolean }[] {
    const defaults = [
      { day: 'Lundi',    open: '06:00', close: '22:00', closed: false },
      { day: 'Mardi',    open: '06:00', close: '22:00', closed: false },
      { day: 'Mercredi', open: '06:00', close: '22:00', closed: false },
      { day: 'Jeudi',    open: '06:00', close: '22:00', closed: false },
      { day: 'Vendredi', open: '06:00', close: '22:00', closed: false },
      { day: 'Samedi',   open: '08:00', close: '20:00', closed: false },
      { day: 'Dimanche', open: '08:00', close: '18:00', closed: true  }
    ];
    if (!hours) return defaults;
    // Format 1: JSON array saved by edit form
    try {
      const parsed = JSON.parse(hours);
      if (Array.isArray(parsed) && parsed.length === 7) return parsed;
    } catch (e) {}
    // Format 2: "Monday: 06:00 - 22:00, Tuesday: ..." saved by auth registration
    const authDayMap: Record<string, number> = {
      monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6
    };
    if (/\w+:\s*\d{1,2}:\d{2}/.test(hours)) {
      const result = defaults.map(d => ({ ...d, closed: true }));
      let matched = false;
      for (const entry of hours.split(',')) {
        const m = entry.trim().match(/^(\w+):\s*(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})$/);
        if (m) {
          const idx = authDayMap[m[1].toLowerCase()];
          if (idx !== undefined) { result[idx] = { ...result[idx], open: m[2], close: m[3], closed: false }; matched = true; }
        }
      }
      if (matched) return result;
    }
    // Format 3: simple "HH:MM - HH:MM"
    const match = hours.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
    return match ? defaults.map(d => ({ ...d, open: match[1], close: match[2], closed: false })) : defaults;
  }

  private parseSchedule(hours: string): void {
    this.gymSchedule = this.parseScheduleString(hours);
  }

  buildScheduleString(): string {
    const frToEn: Record<string, string> = {
      'Lundi': 'Monday', 'Mardi': 'Tuesday', 'Mercredi': 'Wednesday',
      'Jeudi': 'Thursday', 'Vendredi': 'Friday', 'Samedi': 'Saturday', 'Dimanche': 'Sunday'
    };
    return this.gymSchedule
      .filter(s => !s.closed)
      .map(s => `${frToEn[s.day] || s.day}: ${s.open} - ${s.close}`)
      .join(', ');
  }

  getDisplayHours(): string {
    const h = this.gym?.openingHours;
    if (!h) return 'Non défini';
    try {
      const parsed = JSON.parse(h) as { day: string; open: string; close: string; closed: boolean }[];
      if (!Array.isArray(parsed)) return h;
      const open = parsed.filter(d => !d.closed);
      if (open.length === 0) return 'Fermé tous les jours';
      const uniqueTimes = [...new Set(open.map(d => `${d.open}–${d.close}`))];
      const closed = parsed.filter(d => d.closed);
      if (uniqueTimes.length === 1 && closed.length === 0) return uniqueTimes[0];
      if (uniqueTimes.length === 1) return `${uniqueTimes[0]} (sauf ${closed.map(d => d.day.slice(0, 3)).join(', ')})`;
      return open.slice(0, 3).map(d => `${d.day.slice(0, 3)}: ${d.open}–${d.close}`).join(' · ');
    } catch (e) { return h; }
  }

  onGymImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) return;
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

  getGymLocation(): void {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }
    this.gettingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.ngZone.run(() => {
          this.gymLat = pos.coords.latitude;
          this.gymLng = pos.coords.longitude;
          this.gettingLocation = false;
        });
      },
      (err) => {
        this.ngZone.run(() => {
          this.gettingLocation = false;
          alert('Impossible d\'obtenir votre position. Vérifiez les permissions.');
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // === PROGRAM METHODS ===
  openProgramForm(program?: Program): void {
    if (program) {
      this.editingProgram = program;
      this.progTitle = program.title;
      this.progDescription = program.description || '';
      this.progType = program.type || 'STRENGTH';
      this.progDifficulty = program.difficulty || 'BEGINNER';
      this.progCoachId = program.coachId || '';
      this.progDays = program.daysOfWeek || [];
      this.progStartTime = program.startTime || '08:00';
      this.progEndTime = program.endTime || '09:00';
      this.progCapacity = program.capacity || 20;
      this.progPrice = program.price || 0;
    } else {
      this.editingProgram = null;
      this.progTitle = '';
      this.progDescription = '';
      this.progType = 'STRENGTH';
      this.progDifficulty = 'BEGINNER';
      this.progCoachId = '';
      this.progDays = [];
      this.progStartTime = '08:00';
      this.progEndTime = '09:00';
      this.progCapacity = 20;
      this.progPrice = 0;
    }
    this.progSubmitAttempted = false;
    this.progError = '';
    this.openDropdown = null;
    this.showProgramForm = true;
  }

  @HostListener('document:click')
  closeDropdowns(): void { this.openDropdown = null; }

  diffColor(d: string): string {
    const m: Record<string, string> = { BEGINNER: '#22C55E', INTERMEDIATE: '#F59E0B', ADVANCED: '#EF4444' };
    return m[d] || '#aaa';
  }

  get selectedCoachName(): string {
    if (!this.progCoachId) return '— Aucun coach —';
    return this.coaches.find(c => c.id === this.progCoachId)?.name || '— Aucun coach —';
  }

  toggleDay(day: string): void {
    const idx = this.progDays.indexOf(day);
    if (idx > -1) this.progDays.splice(idx, 1);
    else this.progDays.push(day);
  }

  saveProgram(): void {
    this.progSubmitAttempted = true;
    this.progError = '';
    const missing: string[] = [];
    if (!this.progTitle?.trim())       missing.push('Titre');
    if (!this.progType)                missing.push('Type d\'activité');
    if (!this.progDifficulty)          missing.push('Niveau de difficulté');
    if (!this.progCapacity || this.progCapacity < 1) missing.push('Capacité maximale');
    if (!this.progStartTime)           missing.push('Heure de début');
    if (!this.progEndTime)             missing.push('Heure de fin');
    if (this.progPrice == null || this.progPrice < 0) missing.push('Prix d\'inscription');
    if (!this.progDays.length)         missing.push('Jours de la semaine');
    if (missing.length) {
      this.progError = 'Champs obligatoires manquants : ' + missing.join(', ');
      return;
    }
    const coach = this.coaches.find(c => c.id === this.progCoachId);
    const prog: Program = {
      title: this.progTitle,
      description: this.progDescription,
      gymId: this.gym!.id!,
      gymName: this.gym!.name,
      coachId: this.progCoachId || undefined,
      coachName: coach?.name || undefined,
      type: this.progType,
      difficulty: this.progDifficulty,
      daysOfWeek: this.progDays,
      startTime: this.progStartTime,
      endTime: this.progEndTime,
      capacity: this.progCapacity,
      price: this.progPrice
    };

    if (this.editingProgram?.id) {
      this.programService.update(this.editingProgram.id, prog).subscribe({
        next: (updated) => {
          const idx = this.programs.findIndex(p => p.id === updated.id);
          if (idx !== -1) this.programs[idx] = updated;
          this.showProgramForm = false;
        }
      });
    } else {
      this.programService.create(prog).subscribe({
        next: (created) => {
          this.programs = [created, ...this.programs];
          this.showProgramForm = false;
        }
      });
    }
  }

  deleteProgram(id: string): void {
    this.programService.delete(id).subscribe({
      next: () => { this.programs = this.programs.filter(p => p.id !== id); }
    });
  }

  // === BOOKING METHODS ===
  confirmBooking(id: string): void {
    this.bookingService.updateStatus(id, 'CONFIRMED').subscribe({
      next: (updated) => {
        const idx = this.bookings.findIndex(b => b.id === id);
        if (idx !== -1) this.bookings[idx] = updated;
      }
    });
  }

  rejectBooking(id: string): void {
    this.bookingService.updateStatus(id, 'CANCELLED').subscribe({
      next: (updated) => {
        const idx = this.bookings.findIndex(b => b.id === id);
        if (idx !== -1) this.bookings[idx] = updated;
      }
    });
  }

  // === COMPUTED ===
  get pendingBookings(): Booking[] { return this.bookings.filter(b => b.status === 'PENDING'); }
  get totalRevenue(): number { return this.paiements.filter(p => p.statut === 'CONFIRME').reduce((sum, p) => sum + (p.montant || 0), 0); }
  get activeMembers(): number { return this.inscriptions.filter(i => i.statut === 'ACCEPTEE').length; }
  get totalEnrolled(): number { return this.programs.reduce((sum, p) => sum + (p.enrolledCount || 0), 0); }
  get filteredBookings(): Booking[] { return this.bookingFilter ? this.bookings.filter(b => b.status === this.bookingFilter) : this.bookings; }
  get pendingInscriptions(): Inscription[] { return this.inscriptions.filter(i => i.statut === 'EN_ATTENTE'); }
  get filteredInscriptions(): Inscription[] { return this.inscriptionFilter ? this.inscriptions.filter(i => i.statut === this.inscriptionFilter) : this.inscriptions; }
  get acceptedInscriptions(): Inscription[] { return this.inscriptions.filter(i => i.statut === 'ACCEPTEE'); }
  get filteredSubscribers(): Inscription[] {
    const accepted = this.acceptedInscriptions;
    if (!this.subscriberFilter) return accepted;
    if (this.subscriberFilter === 'PAYE') return accepted.filter(i => i.paiementStatut === 'PAYE');
    return accepted.filter(i => i.paiementStatut !== 'PAYE');
  }

  acceptInscription(id: string): void {
    this.inscriptionService.updateStatut(id, 'ACCEPTEE').subscribe({
      next: (updated) => {
        const idx = this.inscriptions.findIndex(i => i.id === id);
        if (idx !== -1) this.inscriptions[idx] = updated;
      }
    });
  }

  refuseInscription(id: string): void {
    this.inscriptionService.updateStatut(id, 'REFUSEE').subscribe({
      next: (updated) => {
        const idx = this.inscriptions.findIndex(i => i.id === id);
        if (idx !== -1) this.inscriptions[idx] = updated;
      }
    });
  }

  deleteInscription(id: string): void {
    this.inscriptionService.delete(id).subscribe({
      next: () => { this.inscriptions = this.inscriptions.filter(i => i.id !== id); }
    });
  }

  formatDate(d?: string): string {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  }

  getTypeIcon(type?: string): string {
    const icons: Record<string, string> = { STRENGTH: '🏋️', CARDIO: '🏃', YOGA: '🧘', HIIT: '⚡', CROSSFIT: '💥', BOXING: '🥊', SWIMMING: '🏊', MARTIAL_ARTS: '🥋' };
    return icons[type || ''] || '💪';
  }

  parseHours(hours?: string): string[] {
    if (!hours) return ['N/A'];
    return hours.split(',').map(h => h.trim()).filter(h => h);
  }

  getDifficultyColor(d?: string): string {
    if (d === 'BEGINNER') return '#10b981';
    if (d === 'INTERMEDIATE') return '#f59e0b';
    return '#ef4444';
  }

  getStatusColor(s?: string): string {
    if (s === 'CONFIRMED' || s === 'COMPLETED') return '#10b981';
    if (s === 'PENDING') return '#f59e0b';
    return '#ef4444';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
