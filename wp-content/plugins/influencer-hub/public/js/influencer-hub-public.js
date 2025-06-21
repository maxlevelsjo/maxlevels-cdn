(function( $ ) {
    'use strict';

    $(function() {
        // Public-facing JavaScript for Influencer Hub plugin.

        // --- Canvas Video Playback Logic ---
        function initVideoCanvas(canvas) {
            const ctx = canvas.getContext('2d');
            const videoUrl = canvas.dataset.videoUrl;
            const thumbnailUrl = canvas.dataset.thumbnailUrl;
            const playButton = canvas.nextElementSibling; // Assuming play button is the next sibling
            
            let video = null; // HTMLVideoElement
            let isPlaying = false;
            let thumbnail = new Image();

            // Function to draw image or video frame on canvas
            function draw() {
                if (isPlaying && video) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    requestAnimationFrame(draw);
                } else if (thumbnail.complete) {
                    ctx.drawImage(thumbnail, 0, 0, canvas.width, canvas.height);
                } else {
                    // Fallback background if thumbnail isn't loaded
                    ctx.fillStyle = '#000';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            }

            // Load thumbnail
            thumbnail.onload = function() {
                draw(); // Draw thumbnail once loaded
            };
            thumbnail.onerror = function() {
                console.error('Influencer Hub: Failed to load thumbnail for video:', thumbnailUrl);
                draw(); // Draw fallback if thumbnail fails
            };
            if (thumbnailUrl) {
                thumbnail.src = thumbnailUrl;
            } else {
                draw(); // Draw fallback immediately if no thumbnail URL
            }

            // Play/Pause toggle
            playButton.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent navigating to permalink directly on button click
                e.stopPropagation(); // Stop event bubbling to the parent link

                if (!video) {
                    // Create video element only when play is first clicked
                    video = document.createElement('video');
                    video.src = videoUrl;
                    video.loop = true; // Optional: loop video
                    video.muted = false; // Start unmuted, user can control volume
                    video.preload = 'auto';
                    video.playsInline = true; // For iOS compatibility
                    video.style.display = 'none'; // Keep video element hidden
                    document.body.appendChild(video); // Append to body so it can play
                    
                    // Event listener for video ready state (when enough data is buffered to play)
                    video.addEventListener('canplaythrough', () => {
                        if (!isPlaying) { // Only attempt to play if user intended to play
                            video.play().then(() => {
                                isPlaying = true;
                                playButton.style.display = 'none'; // Hide play button
                                draw(); // Start drawing video frames
                            }).catch(error => {
                                console.error('Influencer Hub: Video playback failed (autoplay block or other):', error);
                                // Show play button again if playback failed
                                playButton.style.display = 'flex';
                            });
                        }
                    });

                    // Handle video ending (if not looping)
                    video.addEventListener('ended', () => {
                        isPlaying = false;
                        playButton.style.display = 'flex'; // Show play button
                        draw(); // Draw last frame or thumbnail
                    });

                    // Handle pause from user controls
                    video.addEventListener('pause', () => {
                        isPlaying = false;
                        playButton.style.display = 'flex';
                        draw();
                    });

                    // Handle play from user controls
                    video.addEventListener('play', () => {
                        isPlaying = true;
                        playButton.style.display = 'none';
                        draw();
                    });

                    // If video needs to be loaded first, show loading spinner on canvas
                    // For now, let's assume canplaythrough handles it, but complex setups might need a separate loading state.
                }

                if (isPlaying) {
                    video.pause();
                } else {
                    video.play().then(() => {
                        isPlaying = true;
                        playButton.style.display = 'none';
                        draw();
                    }).catch(error => {
                        console.error('Influencer Hub: Video playback failed (user interaction required or other):', error);
                        // Often occurs if not explicitly user-initiated (e.g., re-clicked play after error)
                        // Or if the browser's autoplay policies are strict.
                        playButton.style.display = 'flex';
                    });
                }
            });

            // Prevent navigation if clicking on canvas itself (since play button is sibling)
            canvas.closest('a').addEventListener('click', function(e) {
                if (isPlaying) {
                    // If video is playing, clicking the card should still navigate,
                    // but allow pause to happen first if button is clicked.
                    // This is handled by playButton click listener's e.stopPropagation().
                    // If user clicks outside button but on card, it will navigate.
                }
            });

            // Handle resize: redraw thumbnail/video if canvas resizes (e.g., responsive layout changes)
            function resizeCanvas() {
                const rect = canvas.getBoundingClientRect();
                // Update canvas drawing buffer size to match display size
                canvas.width = rect.width;
                canvas.height = rect.height;
                draw(); // Redraw content to fit new size
            }
            window.addEventListener('resize', resizeCanvas);
            resizeCanvas(); // Initial resize call
        }

        // Initialize all video canvases on the page
        document.querySelectorAll('.video-canvas').forEach(initVideoCanvas);


        // --- General Frontend Scripting (e.g., for carousels, filters) ---

        // Example: If you implement "Load More" functionality via AJAX,
        // you would handle button clicks and AJAX requests here.

        // var $loadMoreButton = $('.influencer-hub-load-more');
        // $loadMoreButton.on('click', function(e) {
        //     e.preventDefault();
        //     var $button = $(this);
        //     var offset = $button.data('offset') || 0;
        //     var platform = $button.data('platform');
        //     // ... perform AJAX call to fetch more posts
        //     // Update offset and append new posts
        // });

        // Example: Initialize carousels if a library like Slick Carousel is used
        // if ($.fn.slick) { // Check if Slick is loaded
        //     $('.carousel-items').slick({
        //         infinite: true,
        //         slidesToShow: 3, // Adjust based on your columns attribute
        //         slidesToScroll: 1,
        //         responsive: [
        //             {
        //                 breakpoint: 1024,
        //                 settings: {
        //                     slidesToShow: 2
        //                 }
        //             },
        //             {
        //                 breakpoint: 600,
        //                 settings: {
        //                     slidesToShow: 1
        //                 }
        //             }
        //         ]
        //     });
        // }
    });

})( jQuery );
