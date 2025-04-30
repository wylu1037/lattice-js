import { ZERO_HASH } from "../constants";

export class LatestBlock {
    currentTBlockNumber: number;
    currentTBlockHash: string;
    currentDBlockHash: string;

    constructor(currentTBlockNumber: number, currentTBlockHash: string, currentDBlockHash: string) {
        this.currentTBlockNumber = currentTBlockNumber;
        this.currentTBlockHash = currentTBlockHash;
        this.currentDBlockHash = currentDBlockHash;
    }

    /**
     * Create an empty latest block
     * 
     * @returns The empty latest block
     */
    public static emptyBlock(): LatestBlock {
        return new LatestBlock(0, ZERO_HASH, ZERO_HASH);
    }
}