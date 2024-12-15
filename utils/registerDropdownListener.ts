export default function registerDropdownListener() {
  if (typeof window !== 'undefined') {
    /**
     * Close dropdown when clicked outside
     */
    window.addEventListener('click', function(e) {
      document.querySelectorAll('.dropdown').forEach(function(dropdown) {
        // @ts-expect-error Property 'open' does not exist on type 'Element'.
        if (!dropdown.contains(e.target)) {
          // @ts-expect-error Property 'open' does not exist on type 'Element'.
          dropdown.open = false;
        }
      });
    });
  }
}