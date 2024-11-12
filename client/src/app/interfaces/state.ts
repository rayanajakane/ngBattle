export interface State {
    getAvailableTiles(): number[];
    setAvailableTiles(availableTiles: number[]): void;

    availablesTilesIncludes(index: number): boolean;

    onRightClick(index: number): void;
    onMouseDown(index: number): void;
    onMouseEnter(): void;
}
