import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class Landing {
  features = [
    { icon: '💪', title: 'Track Workouts', desc: 'Log every set, rep, and PR with intelligent tracking that learns your patterns.' },
    { icon: '🏋️', title: 'Find Gyms', desc: 'Discover top-rated gyms near you with detailed amenities and real reviews.' },
    { icon: '🎯', title: 'Book Programs', desc: 'Join expert-led programs from HIIT to Yoga, tailored to your fitness level.' },
    { icon: '📊', title: 'Analytics', desc: 'Visualize your progress with beautiful charts and personalized insights.' },
    { icon: '👨‍🏫', title: 'Expert Coaches', desc: 'Connect with certified trainers who create custom plans just for you.' },
    { icon: '🏆', title: 'Achievements', desc: 'Earn badges and compete with friends to stay motivated every day.' }
  ];

  stats = [
    { value: '10K+', label: 'Active Members' },
    { value: '500+', label: 'Partner Gyms' },
    { value: '200+', label: 'Pro Coaches' },
    { value: '1M+', label: 'Workouts Logged' }
  ];

  roles = [
    { role: 'MEMBER', icon: '🏃', title: 'Gym Rat', desc: 'Track workouts, find gyms, book sessions, and crush your fitness goals.', color: '#00d4ff' },
    { role: 'OWNER', icon: '🏢', title: 'Gym Owner', desc: 'Manage your gym, create programs, track bookings, and grow your business.', color: '#7c3aed' },
    { role: 'COACH', icon: '🏅', title: 'Coach', desc: 'Build programs, manage clients, track progress, and inspire greatness.', color: '#10b981' }
  ];

  constructor(private router: Router) {}

  goToAuth(role: string): void {
    this.router.navigate(['/auth'], { queryParams: { role } });
  }

  goToLogin(): void {
    this.router.navigate(['/auth']);
  }
}
