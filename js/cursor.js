// Cursor JavaScript - Custom cursor functionality

document.addEventListener('DOMContentLoaded', function() {
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    // Check if custom cursor elements exist
    if (!cursor || !follower) return;
    
    // Mouse position tracking
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    
    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Move cursor immediately
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });
    
    // Animate follower with slight delay
    function animateFollower() {
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        
        follower.style.left = followerX - 10 + 'px';
        follower.style.top = followerY - 10 + 'px';
        
        requestAnimationFrame(animateFollower);
    }
    animateFollower();
    
    // Hide cursor when leaving window
    document.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget) {
            cursor.style.opacity = '0';
            follower.style.opacity = '0';
        }
    });
    
    document.addEventListener('mouseover', () => {
        cursor.style.opacity = '1';
        follower.style.opacity = '1';
    });
    
    // Hover effects for interactive elements
    const hoverElements = document.querySelectorAll(
        'a, button, .solution-card, .founder-card, .client-item, [data-cursor="hover"]'
    );
    
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            follower.style.transform = 'scale(1.2)';
            cursor.style.borderColor = 'var(--secondary)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            follower.style.transform = 'scale(1)';
            cursor.style.borderColor = 'var(--primary)';
        });
    });
    
    // Click effect
    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.8)';
        follower.style.transform = 'scale(0.9)';
    });
    
    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
        follower.style.transform = 'scale(1)';
    });
    
    // Hide custom cursor on touch devices
    function isTouchDevice() {
        return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
    }
    
    if (isTouchDevice()) {
        cursor.style.display = 'none';
        follower.style.display = 'none';
        document.body.style.cursor = 'auto';
    }
});