import { ReviewType } from '@/types';

export type ReviewWithProfile = ReviewType & {
  profile?: {
    username?: string;
    avatar_url?: string;
  };
};

export const mockReviews: ReviewWithProfile[] = [
  {
    id: 1,
    product_id: '11111111-1111-4111-8111-111111111101',
    user_id: 'user-001',
    rating: 5,
    comment: 'Incredible sound quality and the noise cancellation is top-notch.',
    created_at: '2025-01-10T14:30:00.000Z',
    profile: { username: 'Alex M.', avatar_url: 'A' },
  },
  {
    id: 2,
    product_id: '11111111-1111-4111-8111-111111111101',
    user_id: 'user-002',
    rating: 4,
    comment: 'Very comfortable for long sessions. Battery life matches the claims.',
    created_at: '2025-01-08T09:15:00.000Z',
    profile: { username: 'Jordan K.', avatar_url: 'J' },
  },
  {
    id: 3,
    product_id: '11111111-1111-4111-8111-111111111102',
    user_id: 'user-003',
    rating: 5,
    comment: 'Perfect for remote work. Fast, quiet, and the screen is gorgeous.',
    created_at: '2025-01-12T11:00:00.000Z',
    profile: { username: 'Sam R.', avatar_url: 'S' },
  },
  {
    id: 4,
    product_id: '11111111-1111-4111-8111-111111111103',
    user_id: 'user-004',
    rating: 4,
    comment: 'Camera is amazing. Wish the charger was included in the box.',
    created_at: '2025-01-05T16:45:00.000Z',
    profile: { username: 'Taylor B.', avatar_url: 'T' },
  },
  {
    id: 5,
    product_id: '22222222-2222-4222-8222-222222222201',
    user_id: 'user-005',
    rating: 5,
    comment: 'Soft fabric and true to size. Already ordered two more colors.',
    created_at: '2025-01-11T08:20:00.000Z',
    profile: { username: 'Casey L.', avatar_url: 'C' },
  },
  {
    id: 6,
    product_id: '22222222-2222-4222-8222-222222222202',
    user_id: 'user-006',
    rating: 4,
    comment: 'Great fit and comfortable stretch. Washes well without shrinking.',
    created_at: '2025-01-09T13:10:00.000Z',
    profile: { username: 'Morgan P.', avatar_url: 'M' },
  },
  {
    id: 7,
    product_id: '33333333-3333-4333-8333-333333333301',
    user_id: 'user-007',
    rating: 5,
    comment: 'Elegant design and keeps accurate time. Looks more expensive than it is.',
    created_at: '2025-01-07T10:00:00.000Z',
    profile: { username: 'Riley D.', avatar_url: 'R' },
  },
  {
    id: 8,
    product_id: '33333333-3333-4333-8333-333333333302',
    user_id: 'user-008',
    rating: 4,
    comment: 'Perfect size for daily essentials. Strap is adjustable and sturdy.',
    created_at: '2025-01-06T17:30:00.000Z',
    profile: { username: 'Jamie W.', avatar_url: 'J' },
  },
];
