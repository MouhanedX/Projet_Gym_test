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
  stats = [
    { icon: '◎', value: '10K+', label: 'Membres Actifs' },
    { icon: '◼', value: '150+', label: 'Salles Premium' },
    { icon: '★', value: '500+', label: 'Coachs Certifiés' }
  ];

  premiumGyms = [
    { image: 'assets/images/gym-1.jpg', location: 'Tunis', rating: 4.9 },
    { image: 'assets/images/gym-2.jpg', location: 'Sousse', rating: 4.7 },
    { image: 'assets/images/gym-3.jpg', location: 'Kairouan', rating: 4.1 },
    { image: 'assets/images/gym-4.jpg', location: 'Gabes', rating: 4.6 },
    { image: 'assets/images/gym-5.jpg', location: 'Sfax', rating: 4.0 },
    { image: 'assets/images/gym-6.jpg', location: 'Monastir', rating: 4.5 }
  ];

  profiles = [
    {
      icon: '◆',
      title: 'Athlète',
      description: 'Rejoignez des milliers de membres et atteignez vos objectifs fitness',
      features: [
        'Découvrez des salles et coachs certifiés',
        'Suivez vos séances d\'entraînement en temps réel',
        'Participez à des défis et gagnez des récompenses',
        'Échangez vos points contre des récompenses exclusives',
        'Trouvez un partenaire d\'entraînement (Gym Buddy)',
        'Consultez votre progression détaillée'
      ],
      buttonText: 'Commencer comme Athlète',
      buttonColor: 'blue',
      role: 'MEMBER'
    },
    {
      icon: '⊙',
      title: 'Coach Sportif',
      description: 'Développez votre clientèle et gérez efficacement vos entraînements',
      features: [
        'Créez des programmes d\'entraînement personnalisés',
        'Gérez votre agenda et vos clients facilement',
        'Recevez les avis et commentaires de vos clients',
        'Suivez la progression de chaque client',
        'Augmentez vos revenus avec des fonctionnalités premium'
      ],
      buttonText: 'Commencer comme Coach Sportif',
      buttonColor: 'green',
      role: 'COACH'
    },
    {
      icon: '◈',
      title: 'Propriétaire',
      description: 'Gérez votre salle de sport et maximisez votre rentabilité',
      features: [
        'Dashboard complet avec statistiques en temps réel',
        'Gestion automatisée des abonnements et paiements',
        'Suivi du taux d\'occupation et des revenus',
        'Créez des offres promotionnelles et codes promo',
        'Engagement des membres avec les défis mensuel'
      ],
      buttonText: 'Commencer comme Propriétaire',
      buttonColor: 'purple',
      role: 'OWNER'
    }
  ];

  features = [
    {
      id: 'gamification',
      title: 'Gamification',
      description: 'Système de points, badges et récompenses pour rester motivé',
      bgColor: '#FEF3E2'
    },
    {
      id: 'buddy',
      title: 'Gym Buddy',
      description: 'Trouvez des partenaires d\'entraînement compatibles',
      bgColor: '#E8F4FF'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Suivez vos progrès avec des stats détaillées',
      bgColor: '#E7F9F0'
    },
    {
      id: 'secure',
      title: 'Sécurisé',
      description: 'Paiements sécurisés et données protégées',
      bgColor: '#FFE8E8'
    }
  ];

  heroImages = [
    'assets/images/hero-1.png',
    'assets/images/hero-2.jpg',
    'assets/images/hero-3.jpg',
    'assets/images/hero-4.jpg'
  ];

  constructor(private router: Router) {}

  getFullStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.3;
  }

  getEmptyStars(rating: number): number[] {
    const full = Math.floor(rating);
    const half = this.hasHalfStar(rating) ? 1 : 0;
    const empty = 5 - full - half;
    return Array(Math.max(0, empty)).fill(0);
  }

  goToAuth(role?: string): void {
    if (role) {
      this.router.navigate(['/auth'], { queryParams: { role } });
    } else {
      this.router.navigate(['/auth']);
    }
  }

  scrollToProfiles(): void {
    document.getElementById('profiles')?.scrollIntoView({ behavior: 'smooth' });
  }
}
