import { CheckoutService } from '../src/services/CheckoutService.js';
import { CarrinhoBuilder } from './builders/CarrinhoBuilder.js';
import { UserMother } from './builders/UserMother.js';
import { Item } from '../src/domain/Item.js';
import { Pedido } from '../src/domain/Pedido.js';

describe('CheckoutService', () => {
    
    describe('quando o pagamento falha', () => {
        it('deve retornar null', async () => {
            const carrinho = new CarrinhoBuilder().build();

            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: false })
            };

            const repositoryDummy = {};
            const emailDummy = {};

            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryDummy,
                emailDummy
            );

            const pedido = await checkoutService.processarPedido(carrinho, '1234-5678');

            expect(pedido).toBeNull();
        });
    });

    describe('quando um cliente Premium finaliza a compra', () => {
        it('deve aplicar desconto de 10% e enviar email de confirmacao', async () => {
            const usuarioPremium = UserMother.umUsuarioPremium();
            const carrinho = new CarrinhoBuilder()
                .comUser(usuarioPremium)
                .comItens([
                    new Item('Produto A', 100),
                    new Item('Produto B', 100)
                ])
                .build();

            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: true })
            };

            const pedidoSalvo = new Pedido(123, carrinho, 180, 'PROCESSADO');
            const repositoryStub = {
                salvar: jest.fn().mockResolvedValue(pedidoSalvo)
            };

            const emailMock = {
                enviarEmail: jest.fn().mockResolvedValue(undefined)
            };

            const checkoutService = new CheckoutService(
                gatewayStub,
                repositoryStub,
                emailMock
            );

            const resultado = await checkoutService.processarPedido(carrinho, '1234-5678');

            expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, '1234-5678');

            expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
            expect(emailMock.enviarEmail).toHaveBeenCalledWith(
                'premium@email.com',
                'Seu Pedido foi Aprovado!',
                'Pedido 123 no valor de R$180'
            );

            expect(resultado).toBe(pedidoSalvo);
        });
    });
});
