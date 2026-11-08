// Gallery Slideshow and Video Player Management

(function() {
  'use strict';

  var currentImageIndex = 0;
  var currentVideoIndex = 0;
  var allImages = [];
  var allVideos = [];
  var returnFocusByModal = {};
  var audioWasPlayingBeforeVideo = false;

  // Initialize when DOM is ready
  function initializeGallery() {
    var galleryModal = document.getElementById('gallery-modal');
    var videoModal = document.getElementById('video-modal');
    var letterModal = document.getElementById('letter-modal');
    var openImagesBtn = document.getElementById('open-images-btn');
    var openVideosBtn = document.getElementById('open-videos-btn');
    var closingModal = document.getElementById('closing-modal');
    var restartBtn = document.getElementById('restart-btn');
    var closeLetterBtn = document.getElementById('close-letter-btn');

    // Image Slideshow controls
    var prevBtn = document.getElementById('prev-btn');
    var nextBtn = document.getElementById('next-btn');
    var downloadBtn = document.getElementById('download-btn');
    var slideCounter = document.getElementById('slide-counter');
    var slideImage = document.getElementById('slide-image');
    var closeBtn = document.getElementById('close-slideshow-btn');

    // Video Player controls
    var prevVideoBtn = document.getElementById('prev-video-btn');
    var nextVideoBtn = document.getElementById('next-video-btn');
    var videoElement = document.getElementById('video-element');
    var videoCounter = document.getElementById('video-counter');
    var closeVideoBtn = document.getElementById('close-video-btn');
    var downloadVideoBtn = document.getElementById('download-video-btn');

    function getOpenModals() {
      return [galleryModal, videoModal, closingModal, letterModal].filter(function(modal) {
        return modal && modal.classList.contains('show');
      });
    }

    function getTopOpenModal() {
      if (letterModal && letterModal.classList.contains('show')) return letterModal;
      if (videoModal && videoModal.classList.contains('show')) return videoModal;
      if (galleryModal && galleryModal.classList.contains('show')) return galleryModal;
      if (closingModal && closingModal.classList.contains('show')) return closingModal;
      return null;
    }

    function syncScrollLock() {
      var hasOpenModal = getOpenModals().length > 0;
      document.body.style.overflow = hasOpenModal ? 'hidden' : '';
    }

    function getFocusableElements(modal) {
      if (!modal) return [];
      var selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.prototype.filter.call(modal.querySelectorAll(selector), function(element) {
        var style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && element.getAttribute('aria-hidden') !== 'true';
      });
    }

    function showModal(modal) {
      if (!modal) return;
      returnFocusByModal[modal.id] = document.activeElement;
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      syncScrollLock();
      window.requestAnimationFrame(function() {
        var focusable = getFocusableElements(modal);
        if (focusable.length) focusable[0].focus();
      });
    }

    function hideModal(modal) {
      if (!modal) return;
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      syncScrollLock();
      var returnTarget = returnFocusByModal[modal.id];
      delete returnFocusByModal[modal.id];
      var topModal = getTopOpenModal();
      if (returnTarget && document.contains(returnTarget) && (!topModal || topModal.contains(returnTarget))) {
        returnTarget.focus();
      }
    }

    function trapModalFocus(event) {
      if (event.key !== 'Tab') return;
      var modal = getTopOpenModal();
      if (!modal) return;
      var focusable = getFocusableElements(modal);
      if (!focusable.length) {
        event.preventDefault();
        modal.setAttribute('tabindex', '-1');
        modal.focus();
        return;
      }
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    // ===== IMAGE GALLERY FUNCTIONS =====
    function openGallery() {
      if (galleryModal) {
        currentImageIndex = 0;
        if (allImages.length > 0) showSlide(0);
        showModal(galleryModal);
      }
    }

    function closeGallery() {
      hideModal(galleryModal);
    }

    function showSlide(index) {
      if (allImages.length === 0) return;

      // Wrap around
      if (index < 0) {
        currentImageIndex = allImages.length - 1;
      } else if (index >= allImages.length) {
        currentImageIndex = 0;
      } else {
        currentImageIndex = index;
      }

      if (slideImage) {
        slideImage.src = allImages[currentImageIndex];
        slideImage.style.opacity = '0';
        setTimeout(function() {
          slideImage.style.opacity = '1';
        }, 10);
      }

      if (slideCounter) {
        slideCounter.textContent = (currentImageIndex + 1) + ' / ' + allImages.length;
      }
    }

    function nextSlide() {
      showSlide(currentImageIndex + 1);
    }

    function prevSlide() {
      showSlide(currentImageIndex - 1);
    }

    function downloadImage() {
      if (allImages.length === 0) return;

      var imageUrl = allImages[currentImageIndex];
      var imageName = imageUrl.split('/').pop();

      var link = document.createElement('a');
      link.href = imageUrl;
      link.download = imageName || ('memory_' + (currentImageIndex + 1));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // ===== VIDEO PLAYER FUNCTIONS =====
    function openVideoPlayer() {
      if (videoModal) {
        var backgroundAudio = document.getElementById('myAudio');
        audioWasPlayingBeforeVideo = !!(backgroundAudio && !backgroundAudio.paused);
        if (audioWasPlayingBeforeVideo) backgroundAudio.pause();

        currentVideoIndex = 0;
        if (allVideos.length > 0) playVideo(0);
        showModal(videoModal);
      }
    }

    function closeVideoPlayer() {
      if (!videoModal) return;
      hideModal(videoModal);
      if (videoElement) videoElement.pause();

      var backgroundAudio = document.getElementById('myAudio');
      if (audioWasPlayingBeforeVideo && backgroundAudio) {
        backgroundAudio.play().catch(function(error) {
          console.log('Audio resume prevented:', error);
        });
      }
      audioWasPlayingBeforeVideo = false;
    }

    function playVideo(index) {
      if (allVideos.length === 0) return;

      // Wrap around
      if (index < 0) {
        currentVideoIndex = allVideos.length - 1;
      } else if (index >= allVideos.length) {
        currentVideoIndex = 0;
      } else {
        currentVideoIndex = index;
      }

      if (videoElement) {
        // Remove old event listeners
        videoElement.onended = null;

        // Stop and reset current video first
        videoElement.pause();
        if (videoElement.readyState > 0) {
          videoElement.currentTime = 0;
        }

        // Remove completion message if it exists
        var existingMessage = document.querySelector('.video-completion-message');
        if (existingMessage) {
          existingMessage.remove();
        }

        // Set new source and wait for it to load before playing
        videoElement.src = allVideos[currentVideoIndex];
        videoElement.style.opacity = '0';

        // Wait for video to load before playing
        videoElement.onloadedmetadata = function() {
          videoElement.style.opacity = '1';
          videoElement.play().catch(function(error) {
            console.log('Play was prevented:', error);
          });
        };

        // Add event listener for when video ends
        videoElement.onended = function() {
          showVideoCompletionMessage();
        };

        // Fallback in case metadata doesn't load
        setTimeout(function() {
          if (videoElement.style.opacity === '0') {
            videoElement.style.opacity = '1';
          }
        }, 500);
      }

      if (videoCounter) {
        videoCounter.textContent = (currentVideoIndex + 1) + ' / ' + allVideos.length;
      }

      // Show/hide navigation buttons based on video count
      if (prevVideoBtn) {
        prevVideoBtn.style.display = allVideos.length > 1 ? 'flex' : 'none';
      }
      if (nextVideoBtn) {
        nextVideoBtn.style.display = allVideos.length > 1 ? 'flex' : 'none';
      }
    }

    function showVideoCompletionMessage() {
      // Remove any existing message
      var existingMessage = document.querySelector('.video-completion-message');
      if (existingMessage) {
        existingMessage.remove();
      }

      // Create completion message overlay
      var messageDiv = document.createElement('div');
      messageDiv.className = 'video-completion-message';

      var completionText = document.createElement('div');
      completionText.className = 'completion-text';

      var titleP = document.createElement('p');
      titleP.style.fontSize = '24px';
      titleP.style.margin = '0 0 15px 0';
      titleP.style.fontWeight = '600';
      titleP.textContent = '✓ Video Complete!';

      var descP = document.createElement('p');
      descP.style.fontSize = '16px';
      descP.style.margin = '0';
      descP.style.opacity = '0.9';
      descP.textContent = (allVideos.length > 1 ? 'Click NEXT to watch more ➜' : 'That\'s all the videos!');

      completionText.appendChild(titleP);
      completionText.appendChild(descP);
      messageDiv.appendChild(completionText);

      // Make message dismissible by clicking on it
      messageDiv.addEventListener('click', function() {
        messageDiv.remove();
      });

      var videoPlayer = document.querySelector('.video-player');
      if (videoPlayer) {
        videoPlayer.appendChild(messageDiv);
      }
    }

    function downloadVideo() {
      if (allVideos.length === 0) return;

      var videoUrl = allVideos[currentVideoIndex];
      var videoName = videoUrl.split('/').pop();

      var link = document.createElement('a');
      link.href = videoUrl;
      link.download = videoName || ('video_' + (currentVideoIndex + 1));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function nextVideo() {
      playVideo(currentVideoIndex + 1);
    }

    function prevVideo() {
      playVideo(currentVideoIndex - 1);
    }

    // ===== CLOSING MODAL FUNCTIONS =====
    function openClosingModal() {
      showModal(closingModal);
    }

    function closeClosingModal() {
      hideModal(closingModal);
    }

    // ===== LETTER MODAL FUNCTIONS =====
    function openLetter() {
      showModal(letterModal);
    }

    function closeLetter() {
      hideModal(letterModal);
    }

    // ===== EVENT LISTENERS - IMAGE GALLERY =====
    if (openImagesBtn) {
      openImagesBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openGallery();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        closeGallery();
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        downloadImage();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function(e) {
        e.preventDefault();
        nextSlide();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function(e) {
        e.preventDefault();
        prevSlide();
      });
    }

    if (galleryModal) {
      galleryModal.addEventListener('click', function(e) {
        if (e.target === galleryModal) {
          closeGallery();
        }
      });
    }

    var slideshowContainer = document.querySelector('.slideshow-container');
    var swipeStartX = null;
    if (slideshowContainer) {
      slideshowContainer.addEventListener('touchstart', function(e) {
        if (e.touches && e.touches.length === 1) swipeStartX = e.touches[0].clientX;
      }, { passive: true });
      slideshowContainer.addEventListener('touchend', function(e) {
        if (swipeStartX === null || !e.changedTouches || !e.changedTouches.length) return;
        var swipeDistance = e.changedTouches[0].clientX - swipeStartX;
        if (Math.abs(swipeDistance) > 48) {
          if (swipeDistance < 0) nextSlide();
          else prevSlide();
        }
        swipeStartX = null;
      }, { passive: true });
    }

    // ===== EVENT LISTENERS - VIDEO PLAYER =====
    if (openVideosBtn) {
      openVideosBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openVideoPlayer();
      });
    }

    if (closeVideoBtn) {
      closeVideoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        closeVideoPlayer();
      });
    }

    if (downloadVideoBtn) {
      downloadVideoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        downloadVideo();
      });
    }

    if (nextVideoBtn) {
      nextVideoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        nextVideo();
      });
    }

    if (prevVideoBtn) {
      prevVideoBtn.addEventListener('click', function(e) {
        e.preventDefault();
        prevVideo();
      });
    }

    if (videoModal) {
      videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
          closeVideoPlayer();
        }
      });
    }

    // ===== EVENT LISTENERS - LETTER MODAL =====
    if (closeLetterBtn) {
      closeLetterBtn.addEventListener('click', function(e) {
        e.preventDefault();
        closeLetter();
      });
    }

    if (letterModal) {
      letterModal.addEventListener('click', function(e) {
        if (e.target === letterModal) {
          closeLetter();
        }
      });
    }

    // ===== KEYBOARD NAVIGATION =====
    document.addEventListener('keydown', function(e) {
      trapModalFocus(e);
      if (letterModal && letterModal.classList.contains('show')) {
        if (e.key === 'Escape') {
          closeLetter();
        }
      } else if (galleryModal && galleryModal.classList.contains('show')) {
        if (e.key === 'ArrowRight') {
          nextSlide();
        } else if (e.key === 'ArrowLeft') {
          prevSlide();
        } else if (e.key === 'Escape') {
          closeGallery();
        } else if (e.key === 'd' || e.key === 'D') {
          downloadImage();
        }
      } else if (videoModal && videoModal.classList.contains('show')) {
        if (e.key === 'ArrowRight') {
          nextVideo();
        } else if (e.key === 'ArrowLeft') {
          prevVideo();
        } else if (e.key === 'Escape') {
          closeVideoPlayer();
        } else if (e.key === 'd' || e.key === 'D') {
          downloadVideo();
        }
      } else if (e.key === 'Escape') {
        closeClosingModal();
      }
    });

    // ===== RESTART BUTTON =====
    if (restartBtn) {
      restartBtn.addEventListener('click', function() {
        closeClosingModal();
        location.reload();
      });
    }

    // ===== OPEN LETTER BUTTON =====
    var openLetterBtn = document.getElementById('open-letter-btn');
    var openClosingBtn = document.getElementById('open-closing-btn');

    if (openLetterBtn) {
      openLetterBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openLetter();
      });
    }

    if (openClosingBtn) {
      openClosingBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openClosingModal();
      });
    }

    // ===== EXPOSE FUNCTIONS GLOBALLY =====
    window.openGallery = openGallery;
    window.closeGallery = closeGallery;
    window.openVideoPlayer = openVideoPlayer;
    window.closeVideoPlayer = closeVideoPlayer;
    window.openClosingModal = openClosingModal;
    window.closeClosingModal = closeClosingModal;
    window.openLetter = openLetter;
    window.closeLetter = closeLetter;
    window.nextSlide = nextSlide;
    window.prevSlide = prevSlide;
    window.nextVideo = nextVideo;
    window.prevVideo = prevVideo;
    window.downloadImage = downloadImage;
    window.downloadVideo = downloadVideo;
    window.setAllImages = function(images) {
      allImages = Array.isArray(images) ? images : [];
      if (galleryModal && galleryModal.classList.contains('show') && allImages.length > 0) {
        showSlide(0);
      }
    };
    window.setAllVideos = function(videos) {
      allVideos = Array.isArray(videos) ? videos : [];
      if (videoModal && videoModal.classList.contains('show') && allVideos.length > 0) {
        playVideo(0);
      }
    };
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGallery);
  } else {
    initializeGallery();
  }

})();
