<script lang="ts">
  interface Props {
    initialLat?: number;        // Latitud inicial (para edición)
    initialLng?: number;        // Longitud inicial (para edición)
    onLocationChange: (coords: { lat: number; lng: number }) => void;
  }

  let { 
    initialLat = 23.1136, // Default: Havana, Cuba
    initialLng = -82.3666,
    onLocationChange 
  }: Props = $props();

  // Internal state
  let mapContainer: HTMLDivElement;
  let map = $state<google.maps.Map | null>(null);
  let marker = $state<google.maps.Marker | null>(null);
  let lat = $state(initialLat);
  let lng = $state(initialLng);
  let isLoaded = $state(false);
  let isLoading = $state(true);
  let error = $state('');

  const GOOGLE_MAPS_API_KEY = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Load Google Maps API dynamically
  function loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.maps) {
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject(new Error('Error al cargar Google Maps')));
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Error al cargar Google Maps. Verifica tu conexión.'));
      
      document.head.appendChild(script);
    });
  }

  function initializeMap() {
    if (!mapContainer || !window.google?.maps) return;

    const initialPosition = { lat, lng };

    // Create map
    map = new google.maps.Map(mapContainer, {
      center: initialPosition,
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Create draggable marker
    marker = new google.maps.Marker({
      position: initialPosition,
      map: map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      title: 'Arrastra para cambiar ubicación'
    });

    // Handle marker drag
    marker.addListener('dragend', () => {
      const position = marker?.getPosition();
      if (position) {
        updateCoordinates(position.lat(), position.lng());
      }
    });

    // Handle map click
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        
        // Move marker to clicked position
        marker?.setPosition(e.latLng);
        updateCoordinates(newLat, newLng);
      }
    });

    isLoaded = true;
    isLoading = false;
  }

  function updateCoordinates(newLat: number, newLng: number) {
    lat = newLat;
    lng = newLng;
    onLocationChange({ lat: newLat, lng: newLng });
  }

  async function initMap() {
    // Check if API key is configured
    if (!GOOGLE_MAPS_API_KEY) {
      error = 'Configura PUBLIC_GOOGLE_MAPS_API_KEY en .env para habilitar el mapa';
      isLoading = false;
      return;
    }

    try {
      await loadGoogleMapsScript();
      initializeMap();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Error al cargar el mapa';
      isLoading = false;
    }
  }

  // Initialize map when component mounts
  $effect(() => {
    if (mapContainer && !isLoaded && !error) {
      initMap();
    }
  });

  // Update marker position if initial coordinates change
  $effect(() => {
    if (marker && map && isLoaded) {
      const newPosition = { lat: initialLat, lng: initialLng };
      marker.setPosition(newPosition);
      map.setCenter(newPosition);
      lat = initialLat;
      lng = initialLng;
    }
  });

  function retryLoad() {
    error = '';
    isLoading = true;
    initMap();
  }

  function formatCoordinate(value: number, decimals: number = 6): string {
    return value.toFixed(decimals);
  }
</script>

<div class="location-picker">
  <label class="picker-label">Ubicación</label>
  
  {#if error}
    <div class="error-container">
      <div class="error-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <p class="error-message">{error}</p>
      {#if GOOGLE_MAPS_API_KEY}
        <button type="button" class="retry-btn" onclick={retryLoad}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Reintentar
        </button>
      {:else}
        <div class="config-instructions">
          <p>Para habilitar el mapa:</p>
          <ol>
            <li>Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener">Google Cloud Console</a></li>
            <li>Habilita "Maps JavaScript API"</li>
            <li>Crea una API key</li>
            <li>Agrégala a tu archivo <code>.env</code></li>
          </ol>
        </div>
      {/if}
    </div>
  {:else}
    <div class="map-wrapper">
      {#if isLoading}
        <div class="loading-overlay">
          <span class="spinner"></span>
          <span class="loading-text">Cargando mapa...</span>
        </div>
      {/if}
      <div 
        bind:this={mapContainer} 
        class="map-container"
        class:loading={isLoading}
      ></div>
    </div>
    
    <div class="coordinates-display">
      <div class="coordinate">
        <span class="coordinate-label">Latitud</span>
        <span class="coordinate-value">{formatCoordinate(lat)}</span>
      </div>
      <div class="coordinate">
        <span class="coordinate-label">Longitud</span>
        <span class="coordinate-value">{formatCoordinate(lng)}</span>
      </div>
    </div>
    
    <p class="map-hint">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación
    </p>
  {/if}
</div>

<style>
  .location-picker {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .picker-label {
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text-variant);
  }

  .map-wrapper {
    position: relative;
    border-radius: var(--radius-xl);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .map-container {
    width: 100%;
    height: 300px;
    background: rgba(255, 255, 255, 0.03);
  }

  .map-container.loading {
    opacity: 0.5;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    background: rgba(0, 0, 0, 0.5);
    z-index: 10;
  }

  .loading-text {
    font-size: var(--font-size-sm);
    color: var(--color-text);
  }

  .coordinates-display {
    display: flex;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .coordinate {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .coordinate-label {
    font-size: var(--font-size-xs);
    color: var(--color-text-variant);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .coordinate-value {
    font-size: var(--font-size-sm);
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    color: var(--color-text);
  }

  .map-hint {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-xs);
    color: rgba(255, 255, 255, 0.4);
  }

  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-2xl);
    background: rgba(255, 255, 255, 0.03);
    border: 2px dashed rgba(255, 255, 255, 0.15);
    border-radius: var(--radius-xl);
    text-align: center;
    min-height: 300px;
  }

  .error-icon {
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 59, 48, 0.1);
    border-radius: 50%;
    color: #ff6b6b;
  }

  .error-message {
    font-size: var(--font-size-sm);
    color: #ff6b6b;
    max-width: 300px;
  }

  .retry-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text);
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);
    transition: all var(--transition-base);
  }

  .retry-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  .config-instructions {
    text-align: left;
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--radius-md);
    font-size: var(--font-size-xs);
    color: var(--color-text-variant);
  }

  .config-instructions p {
    margin-bottom: var(--spacing-sm);
    font-weight: 500;
  }

  .config-instructions ol {
    margin: 0;
    padding-left: var(--spacing-lg);
  }

  .config-instructions li {
    margin-bottom: var(--spacing-xs);
  }

  .config-instructions a {
    color: var(--color-secondary);
    text-decoration: underline;
  }

  .config-instructions code {
    padding: 2px 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid transparent;
    border-top-color: var(--color-secondary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 480px) {
    .map-container {
      height: 250px;
    }

    .coordinates-display {
      flex-direction: column;
      gap: var(--spacing-sm);
    }
  }
</style>
