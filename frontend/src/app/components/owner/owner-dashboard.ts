import { Component, OnInit } from '@angular/core';
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
  gymAmenities = '';

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
    private router: Router
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
      openingHours: this.gymOpeningHours,
      amenities: this.gymAmenities.split(',').map(a => a.trim()).filter(a => a)
    };

    if (this.gym?.id) {
      this.gymService.update(this.gym.id, gymData).subscribe({
        next: (updated) => { this.gym = updated; this.showGymForm = false; }
      });
    } else {
      this.gymService.create(gymData).subscribe({
        next: (created) => { this.gym = created; this.showGymForm = false; }
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
      this.gymAmenities = (this.gym.amenities || []).join(', ');
    }
    this.showGymForm = true;
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
    this.showProgramForm = true;
  }

  toggleDay(day: string): void {
    const idx = this.progDays.indexOf(day);
    if (idx > -1) this.progDays.splice(idx, 1);
    else this.progDays.push(day);
  }

  saveProgram(): void {
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
