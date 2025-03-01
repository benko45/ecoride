import barba from '@barba/core';
import gsap from 'gsap';

export const initBarba = () => {
    barba.init({
        transitions: [{
            name: "swipe",
            leave({ current }) {
                return gsap.to(current.container, {
                    x: "-100%", // Slide vers la gauche
                    opacity: 0,
                    duration: 0.5
                });
            },
            enter({ next }) {
                return gsap.from(next.container, {
                    x: "100%", // Slide depuis la droite
                    opacity: 0,
                    duration: 0.5
                });
            }
        }]
    });
};
