import React from 'react';
import Meta from '../components/Meta';

const About: React.FC = () => {
  const title = 'About SolarNaija | Nigeria’s Trusted Solar Energy Company';
  const description = 'SolarNaija provides clean, affordable solar energy solutions across Nigeria. Our mission is to power homes and businesses with reliable, renewable electricity.';
  const keywords = 'solar company Nigeria, renewable energy Nigeria, about SolarNaija, solar power provider Lagos';

  const image = '/social-about.png';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
  <Meta title={title} description={description} keywords={keywords} image={image} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About SolarNaija</h1>
        <p className="text-gray-700 mb-6">{description}</p>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Our Mission</h2>
          <p className="text-gray-700">We aim to make solar energy accessible and affordable for homes and businesses across Nigeria through quality products and excellent service.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
