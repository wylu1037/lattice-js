
export class Receipt {
    confirmTime?: string;
    succcess: boolean;
    receiptIndex: number;
    tBlockHash: string;
    contractAddress?: string;
    contractRet?: string;
    jouleUsed: number;
    events: Event[];
    dblockHash: string;
    dblockNumber: number;

    constructor(confirmTime: string, succcess: boolean, receiptIndex: number, tBlockHash: string, contractAddress: string, contractRet: string, jouleUsed: number, events: Event[], dblockHash: string, dblockNumber: number) {
        this.confirmTime = confirmTime;
        this.succcess = succcess;
        this.receiptIndex = receiptIndex;
        this.tBlockHash = tBlockHash;
        this.contractAddress = contractAddress;
        this.contractRet = contractRet;
        this.jouleUsed = jouleUsed;
        this.events = events;
        this.dblockHash = dblockHash;
        this.dblockNumber = dblockNumber;
    }
}

export class Event {
    address: string;
    topics: string[];
    data: Buffer;
    logIndex: number;
    tblockHash: string;
    dblockHash: string;
    dblockNumber: number;
    removed: boolean;
    dataHex: string;

    constructor(address: string, topics: string[], data: Buffer, logIndex: number, tblockHash: string, dblockHash: string, dblockNumber: number, removed: boolean, dataHex: string) {
        this.address = address;
        this.topics = topics;
        this.data = data;
        this.logIndex = logIndex;
        this.tblockHash = tblockHash;
        this.dblockHash = dblockHash;
        this.dblockNumber = dblockNumber;
        this.removed = removed;
        this.dataHex = dataHex;
    }
}