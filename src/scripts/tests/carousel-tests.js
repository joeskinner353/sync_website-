/**
 * Carousel Tests
 * Tests for the carousel functionality on the Concord Music Publishing website
 */

// Test suite for the WritersImages carousel functionality
function testCarouselPosition() {
  console.log('🧪 Running carousel position tests...');
  
  // Get the carousel element
  const carousel = document.querySelector('body > div > div.WritersImages.scrollable-container');
  if (!carousel) {
    console.error('❌ Test failed: WritersImages carousel not found with selector: body > div > div.WritersImages.scrollable-container');
    return false;
  }
  
  console.log('✅ WritersImages carousel found');
  
  // Get the track within the carousel
  const track = carousel.querySelector('.carousel-track');
  if (!track) {
    console.error('❌ Test failed: Carousel track not found within WritersImages carousel');
    return false;
  }
  
  console.log('✅ Carousel track found');
  
  // Store initial position
  const initialPosition = getTransformX(track);
  console.log(`Initial carousel position: ${initialPosition}px`);
  
  // Simulate scrolling by manipulating transform
  const simulatedScrollPosition = initialPosition - 200;
  track.style.transform = `translateX(${simulatedScrollPosition}px)`;
  console.log(`Scrolled to position: ${simulatedScrollPosition}px`);
  
  // Trigger a simulated scroll event to see if position reset mechanisms work
  const scrollEvent = new Event('scroll');
  carousel.dispatchEvent(scrollEvent);
  
  // Check if position was restored or managed properly
  setTimeout(() => {
    const newPosition = getTransformX(track);
    console.log(`Position after scroll event: ${newPosition}px`);
    
    // Check if carousel has moved unexpectedly (comparing with a tolerance)
    if (Math.abs(newPosition - simulatedScrollPosition) > 1 && 
        Math.abs(newPosition - initialPosition) > 1) {
      console.log('ℹ️ Carousel position changed after scroll event - potential auto-reset');
    } else if (Math.abs(newPosition - simulatedScrollPosition) <= 1) {
      console.log('ℹ️ Carousel maintained scrolled position - no auto-reset detected');
    }
    
    // Test complete
    console.log('🧪 Carousel position test complete');
  }, 500);
  
  return true;
}

// Test carousel animation and pausing functionality
function testCarouselAnimation() {
  console.log('🧪 Running carousel animation tests...');
  
  const carousel = document.querySelector('body > div > div.WritersImages.scrollable-container');
  if (!carousel) {
    console.error('❌ Test failed: WritersImages carousel not found');
    return false;
  }
  
  const track = carousel.querySelector('.carousel-track');
  if (!track) {
    console.error('❌ Test failed: Carousel track not found');
    return false;
  }
  
  // Test 1: Verify animation is running
  const initialPosition = getTransformX(track);
  
  // Wait a moment and check if position has changed (animation is running)
  setTimeout(() => {
    const newPosition = getTransformX(track);
    if (initialPosition !== newPosition) {
      console.log('✅ Carousel animation is running correctly');
    } else {
      console.log('❌ Carousel animation may be stuck - position did not change');
    }
    
    // Test 2: Verify mouse hover pauses animation
    console.log('Testing animation pause on hover...');
    
    // Simulate mouseenter to pause animation
    const mouseEnterEvent = new MouseEvent('mouseenter');
    carousel.dispatchEvent(mouseEnterEvent);
    
    const pausePosition = getTransformX(track);
    
    // Wait a moment to see if the animation continues despite hover
    setTimeout(() => {
      const afterPausePosition = getTransformX(track);
      
      if (Math.abs(pausePosition - afterPausePosition) <= 1) {
        console.log('✅ Carousel animation correctly pauses on hover');
      } else {
        console.log('❌ Carousel animation continues despite hover - pause not working');
      }
      
      // Test 3: Verify animation resumes after mouse leave
      console.log('Testing animation resume after mouse leave...');
      
      // Simulate mouseleave to resume animation
      const mouseLeaveEvent = new MouseEvent('mouseleave');
      carousel.dispatchEvent(mouseLeaveEvent);
      
      // Wait a moment to see if animation resumed
      setTimeout(() => {
        const afterResumePosition = getTransformX(track);
        
        if (Math.abs(afterPausePosition - afterResumePosition) > 1) {
          console.log('✅ Carousel animation correctly resumes after hover');
        } else {
          console.log('❌ Carousel animation did not resume after hover');
        }
        
        console.log('🧪 Carousel animation tests complete');
      }, 300);
      
    }, 300);
    
  }, 200);
  
  return true;
}

// Test carousel item duplication/cloning for infinite scroll
function testCarouselCloning() {
  console.log('🧪 Running carousel cloning tests...');
  
  const carousel = document.querySelector('body > div > div.WritersImages.scrollable-container');
  if (!carousel) {
    console.error('❌ Test failed: WritersImages carousel not found');
    return false;
  }
  
  const track = carousel.querySelector('.carousel-track');
  if (!track) {
    console.error('❌ Test failed: Carousel track not found');
    return false;
  }
  
  // Get all the carousel links (both original and cloned items)
  const allLinks = track.querySelectorAll('.carousel-link');
  
  if (allLinks.length === 0) {
    console.error('❌ Test failed: No carousel items found');
    return false;
  }
  
  // Calculate total item width
  let totalWidth = 0;
  allLinks.forEach(link => {
    totalWidth += link.offsetWidth;
  });
  
  // Check if we have duplicated items (should be at least twice the number of unique items)
  const uniqueHrefs = new Set();
  allLinks.forEach(link => {
    if (link.href) {
      uniqueHrefs.add(link.href);
    }
  });
  
  console.log(`Total carousel items: ${allLinks.length}`);
  console.log(`Unique items (by href): ${uniqueHrefs.size}`);
  
  if (allLinks.length > uniqueHrefs.size) {
    console.log('✅ Carousel has properly cloned items for infinite scrolling');
  } else {
    console.log('❌ Carousel may not have properly cloned items - could cause scrolling issues');
  }
  
  // Check track width vs viewport width (should be significantly larger)
  const viewportWidth = carousel.offsetWidth;
  const trackWidth = totalWidth;
  
  console.log(`Viewport width: ${viewportWidth}px`);
  console.log(`Track width: ${trackWidth}px`);
  
  if (trackWidth > viewportWidth * 2) {
    console.log('✅ Track width is sufficient for infinite scrolling');
  } else {
    console.log('❌ Track width may be insufficient for proper infinite scrolling');
  }
  
  console.log('🧪 Carousel cloning tests complete');
  return true;
}

// Test for smooth scrolling and manual scrolling functionality
function testManualScrolling() {
  console.log('🧪 Running manual scrolling tests...');
  
  const carousel = document.querySelector('body > div > div.WritersImages.scrollable-container');
  if (!carousel) {
    console.error('❌ Test failed: WritersImages carousel not found');
    return false;
  }
  
  // Test mouse events for manual scrolling
  const events = ['mousedown', 'mousemove', 'mouseup', 'mouseleave'];
  let allEventsWork = true;
  
  events.forEach(eventName => {
    try {
      const testEvent = new MouseEvent(eventName, {
        bubbles: true,
        cancelable: true,
        clientX: 100,
        clientY: 100
      });
      
      carousel.dispatchEvent(testEvent);
      console.log(`✅ Successfully dispatched ${eventName} event`);
    } catch (err) {
      console.error(`❌ Error dispatching ${eventName} event:`, err);
      allEventsWork = false;
    }
  });
  
  if (allEventsWork) {
    console.log('✅ All mouse events for manual scrolling can be dispatched');
  } else {
    console.log('❌ Some mouse events for manual scrolling failed');
  }
  
  // Check if scrolling state variables exist in main.js
  console.log('ℹ️ Note: Manual checking of scroll state variables in main.js is recommended');
  
  console.log('🧪 Manual scrolling tests complete');
  return true;
}

// Helper: Get the translateX value from a transform style
function getTransformX(element) {
  if (!element || !element.style || !element.style.transform) {
    return 0;
  }
  
  const transform = element.style.transform;
  const match = transform.match(/translateX\(([^)]+)\)/);
  if (match && match[1]) {
    return parseFloat(match[1]);
  }
  
  return 0;
}

// Run all tests when this script is executed
function runAllTests() {
  console.log('🧪 Starting carousel tests...');
  
  // First check if we're on a page with the carousel
  const carousel = document.querySelector('body > div > div.WritersImages.scrollable-container');
  if (!carousel) {
    console.error('❌ WritersImages carousel not found - make sure you run these tests on the homepage');
    return;
  }
  
  // Run the tests
  testCarouselPosition();
  testCarouselAnimation();
  testCarouselCloning();
  testManualScrolling();
  
  console.log('🧪 All tests have been initiated. Check console for results.');
}

// Export for external use
export {
  runAllTests,
  testCarouselPosition,
  testCarouselAnimation,
  testCarouselCloning,
  testManualScrolling
};