import { args, Factory, inject, IServiceLocator, onConstruct } from '../../lib';

export class OnConstructImpl {
    isConstructed = false;

    @onConstruct
    onInit(): void {
        this.isConstructed = true;
    }
}

export class Logger {
    constructor(private prefix: string) {}

    log(): string {
        return this.prefix;
    }
}

export class App {
    constructor(@inject('logger', args('super')) private logger: Logger) {}

    run(): string {
        return this.logger.log();
    }
}

export class Logger2 {
    constructor(private prefix: string, private prefix2: string) {}

    log(): string {
        return this.prefix + this.prefix2;
    }
}

export class App2 {
    private logger: Logger2;

    constructor(@inject(Factory('logger2'), args('super')) private loggerFactory: (prefix2: string) => Logger2) {
        this.logger = loggerFactory('duper');
    }

    run(): string {
        return this.logger.log();
    }
}

export class Logger3 {
    constructor(private prefix: string, private prefix2: string) {}

    log(): string {
        return this.prefix + this.prefix2;
    }
}

export class App3 {
    constructor(@inject('logger3', args('duper')) private logger: Logger3) {}

    run(): string {
        return this.logger.log();
    }
}

export class App4 {
    constructor(@inject('dep1') private dep1: string, private locator: IServiceLocator) {}

    run(): string {
        return `${this.dep1}${this.locator.resolve('dep2')}`;
    }
}
