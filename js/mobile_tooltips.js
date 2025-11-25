document.addEventListener("DOMContentLoaded", () => {
    // Function to check if the device supports touch events
    function isTouchDevice() {
        return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    }

    // Function to initialize or destroy tooltips based on touch support
    function setupTooltipsBasedOnTouch() {
        if (isTouchDevice()) {
            initializeMobileTooltips();
        } else {
            // For non-touch devices, we might want a different behavior or no custom tooltips
            // For now, we destroy mobile-specific tooltips to allow default browser behavior (e.g., title attribute on hover)
            destroyMobileTooltips();
        }
    }

    let activeTooltip = null;
    let tooltipTimeout = null;
    const controlButtonsQuery = ".call-controls .control-btn";

    function removeActiveTooltip() {
        if (activeTooltip) {
            activeTooltip.classList.remove("visible"); // For fade-out effect
            // Wait for fade-out transition to complete before removing
            activeTooltip.addEventListener("transitionend", () => {
                if (activeTooltip && !activeTooltip.classList.contains("visible")) { // Check if it's still the same tooltip and meant to be removed
                    activeTooltip.remove();
                    activeTooltip = null;
                }
            }, { once: true });
        } else if (document.querySelector(".mobile-tooltip-custom:not(.visible)")){
            // Clean up any tooltips that might be stuck in a non-visible state from a previous rapid interaction
            document.querySelectorAll(".mobile-tooltip-custom:not(.visible)").forEach(el => el.remove());
        }
        if (tooltipTimeout) {
            clearTimeout(tooltipTimeout);
            tooltipTimeout = null;
        }
    }

    const buttonClickListeners = new Map();
    let documentClickListener = null;

    function handleButtonClick(event) {
        event.stopPropagation(); // Prevent click from immediately bubbling to document listener
        const button = this;

        if (activeTooltip && activeTooltip.dataset.ownerId === button.id) {
            removeActiveTooltip();
            return;
        }

        removeActiveTooltip();

        const ariaLabel = button.getAttribute("aria-label");
        if (!ariaLabel) return;

        const tooltip = document.createElement("div");
        tooltip.className = "mobile-tooltip-custom";
        tooltip.textContent = ariaLabel;
        tooltip.dataset.ownerId = button.id;

        document.body.appendChild(tooltip);
        activeTooltip = tooltip;

        const buttonRect = button.getBoundingClientRect();
        tooltip.style.visibility = "hidden";
        tooltip.style.display = "block";
        const tooltipRect = tooltip.getBoundingClientRect();
        tooltip.style.visibility = "";
        tooltip.style.display = "";

        let topPosition = buttonRect.top - tooltipRect.height - 10;
        let leftPosition = buttonRect.left + (buttonRect.width / 2) - (tooltipRect.width / 2);

        if (topPosition < 5) {
            topPosition = buttonRect.bottom + 10;
        }
        if (leftPosition < 5) {
            leftPosition = 5;
        }
        if (leftPosition + tooltipRect.width > window.innerWidth - 5) {
            leftPosition = window.innerWidth - tooltipRect.width - 5;
        }
        if (leftPosition < 5) leftPosition = 5;

        tooltip.style.top = `${topPosition + window.scrollY}px`;
        tooltip.style.left = `${leftPosition + window.scrollX}px`;

        // Trigger fade-in by adding class after a short delay
        requestAnimationFrame(() => {
            tooltip.classList.add("visible");
        });

        tooltipTimeout = setTimeout(() => {
            removeActiveTooltip();
        }, 3000);
    }

    function handleDocumentClick(event) {
        if (activeTooltip) {
            const clickedButton = event.target.closest(controlButtonsQuery);
            const clickedTooltip = event.target.closest(".mobile-tooltip-custom");

            if (!clickedTooltip) {
                if (!clickedButton || (clickedButton && activeTooltip.dataset.ownerId !== clickedButton.id)) {
                    removeActiveTooltip();
                }
            }
        }
    }

    function initializeMobileTooltips() {
        const controlButtons = document.querySelectorAll(controlButtonsQuery);
        controlButtons.forEach(button => {
            if (!button.id) { // Ensure buttons have IDs for tooltip ownership tracking
                button.id = `control-btn-${Math.random().toString(36).substr(2, 9)}`;
            }
            if (buttonClickListeners.has(button)) {
                button.removeEventListener("click", buttonClickListeners.get(button));
            }
            const listener = handleButtonClick.bind(button);
            button.addEventListener("click", listener);
            buttonClickListeners.set(button, listener);
        });

        if (documentClickListener) {
            document.removeEventListener("click", documentClickListener, true);
        }
        documentClickListener = handleDocumentClick;
        document.addEventListener("click", documentClickListener, true);
    }

    function destroyMobileTooltips() {
        removeActiveTooltip();
        const controlButtons = document.querySelectorAll(controlButtonsQuery);
        controlButtons.forEach(button => {
            if (buttonClickListeners.has(button)) {
                button.removeEventListener("click", buttonClickListeners.get(button));
                buttonClickListeners.delete(button);
            }
        });
        if (documentClickListener) {
            document.removeEventListener("click", documentClickListener, true);
            documentClickListener = null;
        }
    }

    setupTooltipsBasedOnTouch();

    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        // On resize, re-evaluate if we are on a touch device (though this rarely changes)
        // and re-initialize. This also helps if the layout changes significantly.
        resizeTimeout = setTimeout(setupTooltipsBasedOnTouch, 250);
    });
});

