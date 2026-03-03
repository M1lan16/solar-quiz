import React from 'react';

export const WhatsAppWidget: React.FC = () => {
    return (
        <a
            href="https://wa.me/4915776932074"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[9999] w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95"
            style={{ backgroundColor: '#25D366' }}
            aria-label="Chat with us on WhatsApp"
        >
            <img
                src="https://store-images.s-microsoft.com/image/apps.8453.13655054093851568.4a371b72-2ce8-4bdb-9d83-be49894d3fa0.7f3687b9-847d-4f86-bb5c-c73259e2b38e"
                alt="WhatsApp"
                className="w-[35px] h-[35px] object-cover"
                style={{ filter: 'brightness(0) invert(1)' }} // Optional: depending on if the image is white or needs to be white. But user said "Use the provided Icon URL". Wait, let me check the image. The image is probably the original colored logo or white. Let's just use it directly as requested: "Use the provided Icon URL. Scale the image via CSS to ~35px to fit perfectly inside the 60px button."
            />
        </a>
    );
};
