import React from 'react';

export const WhatsAppWidget: React.FC = () => {
    return (
        <a
            href="https://wa.me/4915776932074?text=Hallo%20SED%20Solar%20Team%2C%20ich%20habe%20eine%20Frage%20zu%20einer%20Photovoltaik-Anlage."
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
            />
        </a>
    );
};
