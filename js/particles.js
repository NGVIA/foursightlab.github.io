// Particles JavaScript - Floating particles animation

document.addEventListener('DOMContentLoaded', function() {
    const particlesContainer = document.getElementById('particles');
    
    if (!particlesContainer) return;
    
    // Particle configuration
    const particleConfig = {
        count: 30,
        minSize: 2,
        maxSize: 6,
        minDuration: 10,
        maxDuration: 30,
        minOpacity: 0.1,
        maxOpacity: 0.3
    };
    
    // Create a single particle
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * (particleConfig.maxSize - particleConfig.minSize) + particleConfig.minSize;
        const duration = Math.random() * (particleConfig.maxDuration - particleConfig.minDuration) + particleConfig.minDuration;
        const opacity = Math.random() * (particleConfig.maxOpacity - particleConfig.minOpacity) + particleConfig.minOpacity;
        const startX = Math.random() * window.innerWidth;
        
        // Apply styles
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = startX + 'px';
        particle.style.opacity = opacity;
        particle.style.animationDuration = duration + 's';
        
        // Random animation delay
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation completes
        setTimeout(() => {
            particle.remove();
        }, duration * 1000);
    }
    
    // Create initial particles
    for (let i = 0; i < particleConfig.count; i++) {
        setTimeout(() => {
            createParticle();
        }, i * 200); // Stagger creation
    }
    
    // Continuously create new particles
    setInterval(createParticle, 1000);
    
    // Adjust particle count based on screen size
    function adjustParticleCount() {
        if (window.innerWidth < 768) {
            particleConfig.count = 15;
        } else if (window.innerWidth < 1024) {
            particleConfig.count = 20;
        } else {
            particleConfig.count = 30;
        }
    }
    
    // Listen for window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(adjustParticleCount, 250);
    });
    
    // Performance optimization: pause particles when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            particlesContainer.style.display = 'none';
        } else {
            particlesContainer.style.display = 'block';
        }
    });
    
    // Clean up particles when scrolling for better performance
    let scrollTimer;
    window.addEventListener('scroll', () => {
        particlesContainer.style.opacity = '0.3';
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            particlesContainer.style.opacity = '1';
        }, 150);
    });
});