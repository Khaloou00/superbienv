import { motion } from 'framer-motion';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = 10;

const VIP_ROWS = ['A', 'B'];

function generateSeats() {
  const seats = [];
  ROWS.forEach((row) => {
    for (let col = 1; col <= COLS; col++) {
      seats.push({
        id: `${row}${col}`,
        row,
        col,
        isVIP: VIP_ROWS.includes(row),
      });
    }
  });
  return seats;
}

const SEATS = generateSeats();

export default function DriveInMap({ takenSeats = [], selected, onSelect }) {
  return (
    <div className="overflow-x-auto">
      {/* Screen */}
      <div className="text-center mb-8">
        <div className="inline-block bg-gradient-to-r from-transparent via-gold/30 to-transparent w-64 h-1 rounded-full" />
        <p className="text-xs text-muted font-label mt-2 tracking-widest uppercase">Écran géant</p>
      </div>

      {/* VIP label */}
      <div className="flex items-center gap-2 mb-1 px-2">
        <span className="text-xs font-label text-gold uppercase tracking-wider">Rangées VIP (A-B)</span>
      </div>

      <div className="flex flex-col gap-2 min-w-max mx-auto">
        {ROWS.map((row) => (
          <div key={row} className="flex items-center gap-2">
            <span className="text-xs text-muted font-label w-4">{row}</span>
            <div className="flex gap-1.5">
              {Array.from({ length: COLS }, (_, i) => {
                const id = `${row}${i + 1}`;
                const isVIP = VIP_ROWS.includes(row);
                const isTaken = takenSeats.includes(id);
                const isSelected = selected === id;
                return (
                  <motion.button
                    key={id}
                    whileTap={{ scale: 0.9 }}
                    disabled={isTaken}
                    onClick={() => onSelect(id, isVIP)}
                    className={`w-9 h-7 rounded text-xs font-label transition-all ${
                      isTaken
                        ? 'bg-cinema/30 text-cinema/50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-gold text-night shadow-lg shadow-gold/40 scale-110'
                        : isVIP
                        ? 'bg-yellow-900/40 text-gold border border-gold/30 hover:bg-gold/20'
                        : 'bg-surface border border-white/10 text-muted hover:border-green-400 hover:text-green-400'
                    }`}
                    title={`${id}${isVIP ? ' (VIP)' : ''}`}
                  >
                    {i + 1}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 px-2 flex-wrap">
        {[
          { color: 'bg-surface border border-green-400', label: 'Disponible' },
          { color: 'bg-cinema/30 border border-cinema/30', label: 'Pris' },
          { color: 'bg-gold', label: 'Sélectionné' },
          { color: 'bg-yellow-900/40 border border-gold/30', label: 'VIP' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-4 h-3 rounded ${color}`} />
            <span className="text-xs text-muted font-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
