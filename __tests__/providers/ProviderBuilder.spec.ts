import { IServiceLocator, ProviderBuilder, ProviderRepository, ServiceLocator, SimpleInjector } from '../../lib';

describe('ProviderBuilder', function () {
    let locator: IServiceLocator;

    beforeEach(() => {
        locator = new ServiceLocator(() => new SimpleInjector(), new ProviderRepository());
    });

    test('withArgs', () => {
        const args = [2, 3, 4];

        const builder = new ProviderBuilder((l, ...deps) => deps).withArgs(...args);

        expect(builder.asRequested().resolve(locator)).toEqual(args);
    });
});
