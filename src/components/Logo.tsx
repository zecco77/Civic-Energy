import React from 'react';

export const Logo = ({ className = "h-12 rounded-md", inverse = false }: { className?: string, inverse?: boolean }) => (
  <img 
    src="https://images.pexels.com/photos/36950112/pexels-photo-36950112.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
    alt="Civic Energy" 
    className={`object-contain ${className}`}
    referrerPolicy="no-referrer"
  />
);
