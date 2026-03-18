import React from 'react';

const BackgroundAnimation: React.FC = () => (
  <div aria-hidden="true" className="bg-anim-root">
    <div className="bg-orb bg-orb-1" />
    <div className="bg-orb bg-orb-2" />
    <div className="bg-orb bg-orb-3" />
    <div className="bg-orb bg-orb-4" />
    <div className="bg-orb bg-orb-5" />
    <div className="bg-orb bg-orb-6" />
  </div>
);

export default BackgroundAnimation;
