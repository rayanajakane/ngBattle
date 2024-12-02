import { Player, PlayerCoord } from '@common/player';
import { ItemTypes } from '@common/tile-types';
import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { ActionHandlerService } from '../action-handler/action-handler.service';
import { ActiveGamesService } from '../active-games/active-games.service';
import { GameService } from '../game.service';
import { LogSenderService } from '../log-sender/log-sender.service';
import { UniqueItemRandomizerService } from '../unique-item-randomiser/unique-item-randomiser.service';
import { InventoryService } from './inventory.service';
describe('InventoryService', () => {
    let service: InventoryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryService,
                ActiveGamesService,
                {
                    provide: LogSenderService,
                    useValue: {},
                },
                UniqueItemRandomizerService,
                GameService,
                {
                    provide: ActionHandlerService,
                    useValue: {},
                },
                {
                    provide: 'GameModel',
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<InventoryService>(InventoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
describe('InventoryService', () => {
    let service: InventoryService;
    let activeGamesService: ActiveGamesService;
    let logSenderService: LogSenderService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InventoryService,
                ActiveGamesService,
                {
                    provide: LogSenderService,
                    useValue: {
                        sendFlagHasBeenPickedUp: jest.fn(),
                    },
                },
                UniqueItemRandomizerService,
                GameService,
                {
                    provide: ActionHandlerService,
                    useValue: {},
                },
                {
                    provide: 'GameModel',
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<InventoryService>(InventoryService);
        activeGamesService = module.get<ActiveGamesService>(ActiveGamesService);
        logSenderService = module.get<LogSenderService>(LogSenderService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addToInventoryAndEmit', () => {
        let server: Server;
        let client: Socket;
        let roomId: string;
        let player: PlayerCoord;
        let item: ItemTypes;

        beforeEach(() => {
            server = {} as Server;
            client = {} as Socket;
            roomId = 'roomId';
            player = {
                player: {
                    inventory: [],
                    attributes: {},
                    stats: {},
                },
                position: 0,
            } as PlayerCoord;
            item = ItemTypes.AA1;
        });

        it('should add item to inventory and emit when inventory is not full', () => {
            jest.spyOn(service, 'isInventoryFull').mockReturnValue(false);
            jest.spyOn(service, 'handleItemEffect').mockImplementation();
            jest.spyOn(service, 'emitNewPlayerInventory').mockImplementation();
            jest.spyOn(service, 'setItemsHeldAttribute').mockImplementation();

            service.addToInventoryAndEmit(server, client, roomId, player, item);

            expect(player.player.inventory).toContain(item);
            expect(service.handleItemEffect).toHaveBeenCalledWith(item, player.player, false, server, roomId);
            expect(service.emitNewPlayerInventory).toHaveBeenCalledWith(server, roomId, player);
            expect(service.setItemsHeldAttribute).toHaveBeenCalledWith(player.player, item);
        });

        it('should emit item to replace when inventory is full', () => {
            jest.spyOn(service, 'isInventoryFull').mockReturnValue(true);
            jest.spyOn(service, 'emitItemToReplace').mockImplementation();

            service.addToInventoryAndEmit(server, client, roomId, player, item);

            expect(service.emitItemToReplace).toHaveBeenCalledWith(server, player, item, roomId);
        });
    });
    describe('InventoryService', () => {
        let service: InventoryService;
        let logSenderService: LogSenderService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    InventoryService,
                    ActiveGamesService,
                    {
                        provide: LogSenderService,
                        useValue: {
                            sendFlagHasBeenPickedUp: jest.fn(),
                        },
                    },
                    UniqueItemRandomizerService,
                    GameService,
                    {
                        provide: ActionHandlerService,
                        useValue: {},
                    },
                    {
                        provide: 'GameModel',
                        useValue: {},
                    },
                ],
            }).compile();

            service = module.get<InventoryService>(InventoryService);
            logSenderService = module.get<LogSenderService>(LogSenderService);
        });

        it('should be defined', () => {
            expect(service).toBeDefined();
        });

        describe('handleCombatInventory', () => {
            it('should call handleItemEffect for AC1 and AC2 items', () => {
                const player: Player = {
                    inventory: [ItemTypes.AC1, ItemTypes.AC2, ItemTypes.AA1],
                    attributes: {},
                    stats: {},
                } as Player;

                jest.spyOn(service, 'handleItemEffect').mockImplementation();

                service.handleCombatInventory(player);

                expect(service.handleItemEffect).toHaveBeenCalledWith(ItemTypes.AC1, player, false);
                expect(service.handleItemEffect).toHaveBeenCalledWith(ItemTypes.AC2, player, false);
                expect(service.handleItemEffect).not.toHaveBeenCalledWith(ItemTypes.AA1, player, false);
            });
        });

        describe('resetCombatBoost', () => {
            it('should call deactivateCombatBoostAttack if isCombatBoostedAttack is true', () => {
                const player: Player = {
                    attributes: {
                        isCombatBoostedAttack: true,
                        isCombatBoostedDefense: false,
                    },
                } as Player;

                jest.spyOn(service, 'deactivateCombatBoostAttack').mockImplementation();
                jest.spyOn(service, 'deactivateCombatBoostDefense').mockImplementation();

                service.resetCombatBoost(player);

                expect(service.deactivateCombatBoostAttack).toHaveBeenCalledWith(player);
                expect(service.deactivateCombatBoostDefense).not.toHaveBeenCalled();
            });

            it('should call deactivateCombatBoostDefense if isCombatBoostedDefense is true', () => {
                const player: Player = {
                    attributes: {
                        isCombatBoostedAttack: false,
                        isCombatBoostedDefense: true,
                    },
                } as Player;

                jest.spyOn(service, 'deactivateCombatBoostAttack').mockImplementation();
                jest.spyOn(service, 'deactivateCombatBoostDefense').mockImplementation();

                service.resetCombatBoost(player);

                expect(service.deactivateCombatBoostAttack).not.toHaveBeenCalled();
                expect(service.deactivateCombatBoostDefense).toHaveBeenCalledWith(player);
            });
        });

        describe('handleItemEffect', () => {
            let player: Player;
            let server: Server;
            let roomId: string;

            beforeEach(() => {
                player = {
                    attributes: {},
                    stats: {},
                    inventory: [],
                } as Player;
                server = {} as Server;
                roomId = 'roomId';
            });

            it('should call handleAA1Item for AA1 item', () => {
                jest.spyOn(service, 'handleAA1Item').mockImplementation();

                service.handleItemEffect(ItemTypes.AA1, player, false);

                expect(service.handleAA1Item).toHaveBeenCalledWith(player, false);
            });

            it('should call handleAA2Item for AA2 item', () => {
                jest.spyOn(service, 'handleAA2Item').mockImplementation();

                service.handleItemEffect(ItemTypes.AA2, player, false);

                expect(service.handleAA2Item).toHaveBeenCalledWith(player, false);
            });

            it('should call handleAC1Item for AC1 item', () => {
                jest.spyOn(service, 'handleAC1Item').mockImplementation();

                service.handleItemEffect(ItemTypes.AC1, player, false);

                expect(service.handleAC1Item).toHaveBeenCalledWith(player, false);
            });

            it('should call handleAC2Item for AC2 item', () => {
                jest.spyOn(service, 'handleAC2Item').mockImplementation();

                service.handleItemEffect(ItemTypes.AC2, player, false);

                expect(service.handleAC2Item).toHaveBeenCalledWith(player, false);
            });

            it('should call handleFlagItem for FLAG_A item', () => {
                jest.spyOn(service, 'handleFlagItem').mockImplementation();

                service.handleItemEffect(ItemTypes.FLAG_A, player, false, server, roomId);

                expect(service.handleFlagItem).toHaveBeenCalledWith(server, roomId, player);
            });
        });

        describe('inventoryContainsItem', () => {
            it('should return true if inventory contains the item', () => {
                const inventory = [ItemTypes.AA1, ItemTypes.AA2];

                const result = service.inventoryContainsItem(inventory, ItemTypes.AA1);

                expect(result).toBe(true);
            });

            it('should return false if inventory does not contain the item', () => {
                const inventory = [ItemTypes.AA1, ItemTypes.AA2];

                const result = service.inventoryContainsItem(inventory, ItemTypes.AC1);

                expect(result).toBe(false);
            });
        });

        describe('isInventoryFull', () => {
            it('should return true if inventory length is 2 or more', () => {
                const inventory = [ItemTypes.AA1, ItemTypes.AA2];

                const result = service.isInventoryFull(inventory);

                expect(result).toBe(true);
            });

            it('should return false if inventory length is less than 2', () => {
                const inventory = [ItemTypes.AA1];

                const result = service.isInventoryFull(inventory);

                expect(result).toBe(false);
            });
        });

        describe('handleAA1Item', () => {
            it('should increase defense by 2 when isReset is false', () => {
                const player: Player = { attributes: { defense: 5 } } as Player;

                service.handleAA1Item(player, false);

                expect(player.attributes.defense).toBe(7);
            });

            it('should decrease defense by 2 when isReset is true', () => {
                const player: Player = { attributes: { defense: 5 } } as Player;

                service.handleAA1Item(player, true);

                expect(player.attributes.defense).toBe(3);
            });
        });

        describe('handleAA2Item', () => {
            it('should increase speed by 2 and decrease health by 1 when isReset is false', () => {
                const player: Player = { attributes: { speed: 5, health: 10 } } as Player;

                service.handleAA2Item(player, false);

                expect(player.attributes.speed).toBe(7);
                expect(player.attributes.health).toBe(9);
            });

            it('should decrease speed by 2 and increase health by 1 when isReset is true', () => {
                const player: Player = { attributes: { speed: 5, health: 10 } } as Player;

                service.handleAA2Item(player, true);

                expect(player.attributes.speed).toBe(3);
                expect(player.attributes.health).toBe(11);
            });
        });

        describe('handleAC1Item', () => {
            it('should increase attack by 2 and set isCombatBoostedAttack to true when isReset is false and currentHealth is <= 2', () => {
                const player: Player = { attributes: { currentHealth: 2, currentAttack: 5, isCombatBoostedAttack: false } } as Player;

                service.handleAC1Item(player, false);

                expect(player.attributes.currentAttack).toBe(7);
                expect(player.attributes.isCombatBoostedAttack).toBe(true);
            });

            it('should decrease attack by 2 and set isCombatBoostedAttack to false when isReset is true and currentHealth is <= 2', () => {
                const player: Player = { attributes: { currentHealth: 2, currentAttack: 5, isCombatBoostedAttack: true } } as Player;

                service.handleAC1Item(player, true);

                expect(player.attributes.currentAttack).toBe(3);
                expect(player.attributes.isCombatBoostedAttack).toBe(false);
            });

            it('should not change attack or isCombatBoostedAttack if currentHealth is > 2', () => {
                const player: Player = { attributes: { currentHealth: 3, currentAttack: 5, isCombatBoostedAttack: false } } as Player;

                service.handleAC1Item(player, false);

                expect(player.attributes.currentAttack).toBe(5);
                expect(player.attributes.isCombatBoostedAttack).toBe(false);
            });
        });

        describe('handleAC2Item', () => {
            it('should increase defense by 2 and set isCombatBoostedDefense to true when isReset is false and currentHealth is <= 3', () => {
                const player: Player = { attributes: { currentHealth: 3, currentDefense: 5, isCombatBoostedDefense: false } } as Player;

                service.handleAC2Item(player, false);

                expect(player.attributes.currentDefense).toBe(7);
                expect(player.attributes.isCombatBoostedDefense).toBe(true);
            });

            it('should decrease defense by 2 and set isCombatBoostedDefense to false when isReset is true and currentHealth is <= 3', () => {
                const player: Player = { attributes: { currentHealth: 4, currentDefense: 5, isCombatBoostedDefense: true } } as Player;

                service.handleAC2Item(player, true);

                expect(player.attributes.currentDefense).toBe(3);
                expect(player.attributes.isCombatBoostedDefense).toBe(false);
            });

            it('should not change defense or isCombatBoostedDefense if currentHealth is > 3', () => {
                const player: Player = { attributes: { currentHealth: 4, currentDefense: 5, isCombatBoostedDefense: false } } as Player;

                service.handleAC2Item(player, false);

                expect(player.attributes.currentDefense).toBe(5);
                expect(player.attributes.isCombatBoostedDefense).toBe(false);
            });
        });

        describe('handleFlagItem', () => {
            it('should call sendFlagHasBeenPickedUp with the correct parameters', () => {
                const server: Server = {} as Server;
                const roomId = 'roomId';
                const player: Player = { name: 'playerName' } as Player;

                service.handleFlagItem(server, roomId, player);

                expect(logSenderService.sendFlagHasBeenPickedUp).toHaveBeenCalledWith(server, roomId, player.name);
            });
        });

        describe('getSlippingChance', () => {
            it('should return 0 if player has AF1 item', () => {
                const player: Player = { inventory: [ItemTypes.AF1] } as Player;

                const result = service.getSlippingChance(player);

                expect(result).toBe(0);
            });

            it('should return 0.1 if player does not have AF1 item', () => {
                const player: Player = { inventory: [] } as Player;

                const result = service.getSlippingChance(player);

                expect(result).toBe(0.1);
            });
        });

        describe('hasAF2Item', () => {
            it('should return true if player has AF2 item', () => {
                const player: Player = { inventory: [ItemTypes.AF2] } as Player;

                const result = service.hasAF2Item(player);

                expect(result).toBe(true);
            });

            it('should return false if player does not have AF2 item', () => {
                const player: Player = { inventory: [] } as Player;

                const result = service.hasAF2Item(player);

                expect(result).toBe(false);
            });
        });

        describe('deactivateCombatBoostAttack', () => {
            it('should decrease currentAttack by 2 and set isCombatBoostedAttack to false', () => {
                const player: Player = { attributes: { currentAttack: 5, isCombatBoostedAttack: true } } as Player;

                service.deactivateCombatBoostAttack(player);

                expect(player.attributes.currentAttack).toBe(3);
                expect(player.attributes.isCombatBoostedAttack).toBe(false);
            });
        });

        describe('deactivateCombatBoostDefense', () => {
            it('should decrease currentSpeed by 2 and set isCombatBoostedDefense to false', () => {
                const player: Player = { attributes: { currentSpeed: 5, isCombatBoostedDefense: true } } as Player;

                service.deactivateCombatBoostDefense(player);

                expect(player.attributes.currentSpeed).toBe(3);
                expect(player.attributes.isCombatBoostedDefense).toBe(false);
            });
        });
    });
});
