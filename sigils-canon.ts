
export type ElementType = 'Воздух' | 'Вода' | 'Огонь' | 'Земля' | 'Эфир' | 'Плетение';

export interface SigilDef {
  id: number;
  name: string;
  element: ElementType;
  tz: string;
  aura: string;
}

export const SIGILS_CANON: SigilDef[] = [
  // ВОЗДУХ (1-11)
  { id: 1, name: 'Whisper', element: 'Воздух', tz: 'Thin curved line splitting into two', aura: 'Cyan' },
  { id: 2, name: 'Gate of Winds', element: 'Воздух', tz: 'Parallel vertical lines, vortex center', aura: 'Cyan' },
  { id: 3, name: 'The Signal', element: 'Воздух', tz: 'Circle with three radiating rays', aura: 'Cyan' },
  { id: 4, name: 'Feather', element: 'Воздух', tz: 'Slightly curved spine with fine diagonal hairs', aura: 'Cyan' },
  { id: 5, name: 'Zephyr', element: 'Воздух', tz: 'Spiral infinity shape horizontally stretched', aura: 'Cyan' },
  { id: 6, name: 'Skyward', element: 'Воздух', tz: 'Upward arrow with feathered base', aura: 'Cyan' },
  { id: 7, name: 'Breeze', element: 'Воздух', tz: 'Three soft horizontal waves', aura: 'Cyan' },
  { id: 8, name: 'Ascent', element: 'Воздух', tz: 'Step-like pattern rising to the right', aura: 'Cyan' },
  { id: 9, name: 'Cloud Core', element: 'Воздух', tz: 'Double circle with mist-like strokes', aura: 'Cyan' },
  { id: 10, name: 'Gale Strike', element: 'Воздух', tz: 'Sharp diagonal jagged line', aura: 'Cyan' },
  { id: 11, name: 'Watcher', element: 'Воздух', tz: 'Eye outline with light rays above', aura: 'Cyan' },
  // ВОДА (12-22)
  { id: 12, name: 'Ripple', element: 'Вода', tz: 'Concentric broken circles', aura: 'Aqua' },
  { id: 13, name: 'Deep Tide', element: 'Вода', tz: 'Two heavy interconnected waves', aura: 'Aqua' },
  { id: 14, name: 'Abyss', element: 'Вода', tz: 'Downward spiral fading into darkness', aura: 'Aqua' },
  { id: 15, name: 'Mist Key', element: 'Вода', tz: 'Vertical line with blurred edges', aura: 'Aqua' },
  { id: 16, name: 'The Bond', element: 'Вода', tz: 'Intertwined knot of two lines', aura: 'Aqua' },
  { id: 17, name: 'Current', element: 'Вода', tz: 'Flowing parallel curves', aura: 'Aqua' },
  { id: 18, name: 'Ice Shard', element: 'Вода', tz: 'Sharp angular diamond shape', aura: 'Aqua' },
  { id: 19, name: 'Fountain', element: 'Вода', tz: 'Central line with arcs falling from top', aura: 'Aqua' },
  { id: 20, name: 'Tearline', element: 'Вода', tz: 'Elongated drop shape', aura: 'Aqua' },
  { id: 21, name: 'Vortex', element: 'Вода', tz: 'Rapidly tightening spiral', aura: 'Aqua' },
  { id: 22, name: 'Stillness', element: 'Вода', tz: 'Single thin horizontal line', aura: 'Aqua' },
  // ОГОНЬ (23-33)
  { id: 23, name: 'The Spark', element: 'Огонь', tz: 'Small cross with split ends', aura: 'Orange' },
  { id: 24, name: 'The Strike', element: 'Огонь', tz: 'Two colliding diagonal lines', aura: 'Orange' },
  { id: 25, name: 'Flare', element: 'Огонь', tz: 'Star-like burst with uneven rays', aura: 'Orange' },
  { id: 26, name: 'Ember', element: 'Огонь', tz: 'Small solid circle with 3 dots around', aura: 'Orange' },
  { id: 27, name: 'The Clash', element: 'Огонь', tz: 'X-shape with glowing center', aura: 'Orange' },
  { id: 28, name: 'Solaris', element: 'Огонь', tz: 'Circle within a triangle', aura: 'Orange' },
  { id: 29, name: 'Scorch', element: 'Огонь', tz: 'Jagged horizontal burn mark line', aura: 'Orange' },
  { id: 30, name: 'Pyre', element: 'Огонь', tz: 'Vertical line with flame-like branches', aura: 'Orange' },
  { id: 31, name: 'Ignis', element: 'Огонь', tz: 'V-shape pointing up with dot inside', aura: 'Orange' },
  { id: 32, name: 'Heatwave', element: 'Огонь', tz: 'Vertical sine wave of light', aura: 'Orange' },
  { id: 33, name: 'Inferno', element: 'Огонь', tz: 'Heavy vertical column of energy', aura: 'Orange' },
  // ЗЕМЛЯ (34-44)
  { id: 34, name: 'Rootmark', element: 'Земля', tz: 'Y-shape branching downwards', aura: 'Olive' },
  { id: 35, name: 'Iron Jaw', element: 'Земля', tz: 'Two heavy horizontal brackets', aura: 'Olive' },
  { id: 36, name: 'Grain', element: 'Земля', tz: 'Series of small vertical dashes', aura: 'Olive' },
  { id: 37, name: 'Mountain', element: 'Земля', tz: 'Steep triangle with line at base', aura: 'Olive' },
  { id: 38, name: 'Hollow', element: 'Земля', tz: 'U-shape holding a dot', aura: 'Olive' },
  { id: 39, name: 'Anchor', element: 'Земля', tz: 'T-shape with curved bottom hooks', aura: 'Olive' },
  { id: 40, name: 'Summit', element: 'Земля', tz: 'Sharp peak with horizontal bar', aura: 'Olive' },
  { id: 41, name: 'Crystal', element: 'Земля', tz: 'Hexagonal outline with internal lines', aura: 'Olive' },
  { id: 42, name: 'Stone', element: 'Земля', tz: 'Solid blocky rectangle', aura: 'Olive' },
  { id: 43, name: 'Clay', element: 'Земля', tz: 'Soft rounded oval shape', aura: 'Olive' },
  { id: 44, name: 'Obelisk', element: 'Земля', tz: 'Tall thin tapering pillar', aura: 'Olive' },
  // ЭФИР (45-55)
  { id: 45, name: 'Fate Thread', element: 'Эфир', tz: 'Infinite vertical line', aura: 'Gold' },
  { id: 46, name: 'Void Pulse', element: 'Эфир', tz: 'Black circle with glowing edge', aura: 'Gold' },
  { id: 47, name: 'Chrono Gate', element: 'Эфир', tz: 'Clockwise rotating arc', aura: 'Gold' },
  { id: 48, name: 'Spirit', element: 'Эфир', tz: 'Wispy vertical line with loops', aura: 'Gold' },
  { id: 49, name: 'Nebula', element: 'Эфир', tz: 'Fractal-like branching cloud', aura: 'Gold' },
  { id: 50, name: 'Astral', element: 'Эфир', tz: 'Point with 8 thin rays', aura: 'Gold' },
  { id: 51, name: 'Ghost', element: 'Эфир', tz: 'Faded semi-circle', aura: 'Gold' },
  { id: 52, name: 'Dream', element: 'Эфир', tz: 'Crescent moon with dot above', aura: 'Gold' },
  { id: 53, name: 'Soul Link', element: 'Эфир', tz: 'Two circles connected by a thin line', aura: 'Gold' },
  { id: 54, name: 'Pulse', element: 'Эфир', tz: 'Rhythmic heartbeat line', aura: 'Gold' },
  { id: 55, name: 'First Light', element: 'Эфир', tz: 'Small burst at the center', aura: 'Gold' },
  // ПЛЕТЕНИЕ (56-66)
  { id: 56, name: 'Mirror Key', element: 'Плетение', tz: 'Two mirrored vertical L-shapes', aura: 'Violet' },
  { id: 57, name: 'Pattern', element: 'Плетение', tz: 'Grid of 4 small dots', aura: 'Violet' },
  { id: 58, name: 'The Knot', element: 'Плетение', tz: 'Celtic-like endless loop', aura: 'Violet' },
  { id: 59, name: 'Amplifier', element: 'Плетение', tz: 'V-shape with parallel second line', aura: 'Violet' },
  { id: 60, name: 'Warp', element: 'Плетение', tz: 'Curved lines bending inward', aura: 'Violet' },
  { id: 61, name: 'Web', element: 'Плетение', tz: 'Radial lines with thin connections', aura: 'Violet' },
  { id: 62, name: 'Link', element: 'Плетение', tz: 'Two interlocking squares', aura: 'Violet' },
  { id: 63, name: 'Woven Path', element: 'Плетение', tz: 'Stitched diagonal line', aura: 'Violet' },
  { id: 64, name: 'Loom', element: 'Плетение', tz: 'Vertical lines crossed by one heavy horizontal', aura: 'Violet' },
  { id: 65, name: 'Pattern Flow', element: 'Плетение', tz: 'S-shape made of dots', aura: 'Violet' },
  { id: 66, name: 'Catalyst', element: 'Плетение', tz: 'Explosive burst with a dot center', aura: 'Violet' }
];
