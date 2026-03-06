import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GymService } from '../../services/gym.service';
import { ProgramService } from '../../services/program.service';
import { WorkoutService } from '../../services/workout.service';
import { BookingService } from '../../services/booking.service';
import { User } from '../../models/user';
import { Gym } from '../../models/gym';
import { Program } from '../../models/program';
import { WorkoutLog, Exercise } from '../../models/workout';
import { Booking } from '../../models/booking';
import * as L from 'leaflet';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './member-dashboard.html',
  styleUrl: './member-dashboard.css'
})
export class MemberDashboard implements OnInit, OnDestroy {
  user: User | null = null;
  activeTab = 'overview';
  gyms: Gym[] = [];
  programs: Program[] = [];
  workouts: WorkoutLog[] = [];
  bookings: Booking[] = [];
  loading = true;
  darkMode = false;

  // Map
  private gymMap: L.Map | null = null;
  private gymMapInitialized = false;
  showMapView = false;
  userLat = 36.8065;
  userLng = 10.1815;
  userLocationFound = false;

  // Workout form
  showWorkoutForm = false;
  workoutDate = '';
  workoutType = 'STRENGTH';
  workoutDuration = 60;
  workoutCalories = 0;
  workoutMood = 'GOOD';
  workoutNotes = '';
  exercises: Exercise[] = [{ name: '', sets: 3, reps: 10, weight: 0 }];

  // Booking form
  showBookingForm = false;
  selectedProgram: Program | null = null;
  bookingDate = '';

  // Search
  gymSearch = '';
  programFilter = '';

  tabs = [
    { key: 'overview', label: 'Dashboard', icon: '📊' },
    { key: 'workouts', label: 'Séances', icon: '💪' },
    { key: 'gyms', label: 'Salles', icon: '🏋️' },
    { key: 'programs', label: 'Programmes', icon: '🎯' },
    { key: 'bookings', label: 'Réservations', icon: '📅' }
  ];

  workoutTypes = ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'MIXED'];
  moods = [
    { value: 'GREAT', icon: '🔥', label: 'Great' },
    { value: 'GOOD', icon: '💪', label: 'Good' },
    { value: 'OKAY', icon: '👌', label: 'Okay' },
    { value: 'TIRED', icon: '😴', label: 'Tired' }
  ];

  constructor(
    private authService: AuthService,
    private gymService: GymService,
    private programService: ProgramService,
    private workoutService: WorkoutService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.loadData();
    this.workoutDate = new Date().toISOString().split('T')[0];
    this.bookingDate = new Date().toISOString().split('T')[0];
  }

  loadData(): void {
    this.loading = true;
    this.gymService.list().subscribe({ next: g => this.gyms = g, error: () => {} });
    this.programService.list().subscribe({ next: p => this.programs = p, error: () => {} });
    if (this.user?.id) {
      this.workoutService.getByMember(this.user.id).subscribe({ next: w => { this.workouts = w; this.loading = false; }, error: () => { this.loading = false; } });
      this.bookingService.getByMember(this.user.id).subscribe({ next: b => this.bookings = b, error: () => {} });
    } else {
      this.loading = false;
    }
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'gyms' && this.showMapView) {
      setTimeout(() => this.initGymMap(), 200);
    }
    if (tab !== 'gyms') {
      this.destroyGymMap();
    }
  }

  toggleDark(): void {
    this.darkMode = !this.darkMode;
    document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
  }

  // === WORKOUT METHODS ===
  addExercise(): void {
    this.exercises.push({ name: '', sets: 3, reps: 10, weight: 0 });
  }

  removeExercise(i: number): void {
    this.exercises.splice(i, 1);
  }

  saveWorkout(): void {
    const validExercises = this.exercises.filter(e => e.name.trim());
    if (!validExercises.length) return;

    const log: WorkoutLog = {
      memberId: this.user!.id!,
      memberName: this.user!.name,
      date: this.workoutDate,
      type: this.workoutType,
      exercises: validExercises,
      durationMinutes: this.workoutDuration,
      caloriesBurned: this.workoutCalories,
      mood: this.workoutMood,
      notes: this.workoutNotes
    };

    this.workoutService.create(log).subscribe({
      next: (saved) => {
        this.workouts = [saved, ...this.workouts];
        this.showWorkoutForm = false;
        this.resetWorkoutForm();
      }
    });
  }

  resetWorkoutForm(): void {
    this.workoutDate = new Date().toISOString().split('T')[0];
    this.workoutType = 'STRENGTH';
    this.workoutDuration = 60;
    this.workoutCalories = 0;
    this.workoutMood = 'GOOD';
    this.workoutNotes = '';
    this.exercises = [{ name: '', sets: 3, reps: 10, weight: 0 }];
  }

  deleteWorkout(id: string): void {
    this.workoutService.delete(id).subscribe({
      next: () => { this.workouts = this.workouts.filter(w => w.id !== id); }
    });
  }

  // === BOOKING METHODS ===
  openBooking(program: Program): void {
    this.selectedProgram = program;
    this.showBookingForm = true;
  }

  submitBooking(): void {
    if (!this.selectedProgram || !this.user) return;

    const booking: Booking = {
      memberId: this.user.id!,
      memberName: this.user.name,
      programId: this.selectedProgram.id!,
      programTitle: this.selectedProgram.title,
      gymId: this.selectedProgram.gymId,
      gymName: this.selectedProgram.gymName,
      coachId: this.selectedProgram.coachId,
      coachName: this.selectedProgram.coachName,
      date: this.bookingDate,
      timeSlot: `${this.selectedProgram.startTime} - ${this.selectedProgram.endTime}`,
      status: 'PENDING'
    };

    this.bookingService.create(booking).subscribe({
      next: (saved) => {
        this.bookings = [saved, ...this.bookings];
        this.showBookingForm = false;
        this.selectedProgram = null;
        this.programService.enroll(booking.programId).subscribe();
      }
    });
  }

  cancelBooking(id: string): void {
    this.bookingService.updateStatus(id, 'CANCELLED').subscribe({
      next: (updated) => {
        const idx = this.bookings.findIndex(b => b.id === id);
        if (idx !== -1) this.bookings[idx] = updated;
      }
    });
  }

  // === COMPUTED ===
  get filteredGyms(): Gym[] {
    if (!this.gymSearch) return this.gyms;
    const q = this.gymSearch.toLowerCase();
    return this.gyms.filter(g => g.name.toLowerCase().includes(q) || g.city?.toLowerCase().includes(q));
  }

  get filteredPrograms(): Program[] {
    if (!this.programFilter) return this.programs;
    return this.programs.filter(p => p.type === this.programFilter);
  }

  get totalWorkouts(): number { return this.workouts.length; }
  get totalCalories(): number { return this.workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0); }
  get totalMinutes(): number { return this.workouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0); }
  get activeBookings(): number { return this.bookings.filter(b => b.status !== 'CANCELLED').length; }

  getTypeIcon(type?: string): string {
    const icons: Record<string, string> = { STRENGTH: '🏋️', CARDIO: '🏃', YOGA: '🧘', HIIT: '⚡', CROSSFIT: '💥', BOXING: '🥊', SWIMMING: '🏊', MARTIAL_ARTS: '🥋', FLEXIBILITY: '🤸', MIXED: '🔄' };
    return icons[type || ''] || '💪';
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

  // === MAP METHODS ===
  toggleMapView(): void {
    this.showMapView = !this.showMapView;
    if (this.showMapView) {
      this.getUserLocation();
      setTimeout(() => this.initGymMap(), 200);
    } else {
      this.destroyGymMap();
    }
  }

  private getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userLat = pos.coords.latitude;
          this.userLng = pos.coords.longitude;
          this.userLocationFound = true;
          if (this.gymMap) {
            this.gymMap.setView([this.userLat, this.userLng], 13);
            this.addGymMarkers();
          }
        },
        () => { /* Use default location */ }
      );
    }
  }

  private initGymMap(): void {
    if (this.gymMapInitialized || !document.getElementById('member-gym-map')) return;

    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.gymMap = L.map('member-gym-map', {
      center: [this.userLat, this.userLng],
      zoom: 12
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.gymMap);

    // User location marker (blue circle)
    if (this.userLocationFound) {
      L.circleMarker([this.userLat, this.userLng], {
        radius: 10, color: '#00d4ff', fillColor: '#00d4ff', fillOpacity: 0.6, weight: 2
      }).addTo(this.gymMap).bindPopup('<b>📍 You are here</b>');
    }

    this.addGymMarkers();
    this.gymMapInitialized = true;
    setTimeout(() => this.gymMap?.invalidateSize(), 100);
  }

  private addGymMarkers(): void {
    if (!this.gymMap) return;
    const gymIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    for (const gym of this.gyms) {
      if (gym.latitude && gym.longitude) {
        const dist = this.getDistance(this.userLat, this.userLng, gym.latitude, gym.longitude);
        L.marker([gym.latitude, gym.longitude], { icon: gymIcon })
          .addTo(this.gymMap!)
          .bindPopup(`<div style="font-family:Inter,sans-serif"><b>${gym.name}</b><br>📍 ${gym.address}<br>💰 ${gym.monthlyPrice || 'N/A'} DT/mo<br>📏 ${dist.toFixed(1)} km away</div>`);
      }
    }
  }

  getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  getGymDistance(gym: Gym): string {
    if (!gym.latitude || !gym.longitude) return '';
    const d = this.getDistance(this.userLat, this.userLng, gym.latitude, gym.longitude);
    return d.toFixed(1) + ' km';
  }

  get sortedGyms(): Gym[] {
    let list = this.filteredGyms;
    if (this.userLocationFound) {
      list = [...list].sort((a, b) => {
        const dA = (a.latitude && a.longitude) ? this.getDistance(this.userLat, this.userLng, a.latitude, a.longitude) : 99999;
        const dB = (b.latitude && b.longitude) ? this.getDistance(this.userLat, this.userLng, b.latitude, b.longitude) : 99999;
        return dA - dB;
      });
    }
    return list;
  }

  private destroyGymMap(): void {
    if (this.gymMap) {
      this.gymMap.remove();
      this.gymMap = null;
      this.gymMapInitialized = false;
    }
  }

  ngOnDestroy(): void {
    this.destroyGymMap();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
