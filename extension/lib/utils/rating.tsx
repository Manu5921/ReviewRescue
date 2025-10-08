import React from 'react';

/**
 * Render star icons for a rating (1-5)
 * @param rating Number of stars (1-5)
 * @param size Size of stars ('sm' | 'md' | 'lg')
 * @returns JSX element with star icons
 */
export function renderStars(
  rating: 1 | 2 | 3 | 4 | 5,
  size: 'sm' | 'md' | 'lg' = 'md'
): React.ReactNode {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        className={`inline-block ${sizeClasses[size]} ${
          i <= rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    );
  }

  return <div className="inline-flex items-center space-x-0.5">{stars}</div>;
}

/**
 * Get color class for rating badge
 * @param rating Number of stars (1-5)
 * @returns Tailwind color class
 */
export function getRatingColorClass(rating: 1 | 2 | 3 | 4 | 5): string {
  if (rating >= 4) return 'bg-green-100 text-green-800';
  if (rating === 3) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

/**
 * Get text description for rating
 * @param rating Number of stars (1-5)
 * @returns Text description
 */
export function getRatingDescription(rating: 1 | 2 | 3 | 4 | 5): string {
  const descriptions = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };
  return descriptions[rating];
}
