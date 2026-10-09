import time
from collections import defaultdict, deque
from threading import Lock


class RateLimiter:
    """Límite de eventos por clave en una ventana deslizante, en memoria.

    Vale para un único proceso de la API (como se despliega ahora). Al reiniciar
    la API los contadores se vacían, lo que solo afecta a bloqueos en curso.
    """

    def __init__(self, max_events: int, window_seconds: int):
        self.max_events = max_events
        self.window = window_seconds
        self._events: dict[str, deque] = defaultdict(deque)
        self._lock = Lock()

    def _prune(self, key: str, now: float) -> deque:
        events = self._events[key]
        while events and events[0] <= now - self.window:
            events.popleft()
        if not events:
            self._events.pop(key, None)
        return events

    def retry_after(self, key: str) -> int:
        """Segundos hasta que la clave deja de estar bloqueada (0 = no bloqueada)."""
        with self._lock:
            now = time.monotonic()
            events = self._prune(key, now)
            if len(events) < self.max_events:
                return 0
            return max(1, int(events[0] + self.window - now))

    def hit(self, key: str) -> bool:
        """Registra un evento. Devuelve False si la clave ya había llegado al límite."""
        with self._lock:
            now = time.monotonic()
            events = self._prune(key, now)
            if len(events) >= self.max_events:
                return False
            self._events[key].append(now)
            return True

    def reset(self, key: str) -> None:
        with self._lock:
            self._events.pop(key, None)
