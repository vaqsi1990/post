import Image from 'next/image';

const Hero = () => {
  return (
    <section className="hero-parallax-container">
      {/* Static hero background */}
      <div className="hero-image-layer" aria-hidden="true">
        <Image
          src="/hero/hero1.png"
          alt="Hero background"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
      </div>
    </section>
  );
};

export default Hero;
