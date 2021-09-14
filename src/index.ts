import 'reflect-metadata';

export interface ObjectAny {
  [key: string]: any
}

interface ExDepOptions {
  type?: 'multiton' | 'singleton',
  key?: string
}

interface ExDepBase {
  key: string,
  type: 'multiton' | 'singleton'
}

interface ExDep extends ExDepBase {
  ctr: ObjectAny
  instance?: ObjectAny
}

export class ExContainer {
  private container: Map<string, ExDep>;

  constructor () {
    this.container = new Map();
    this.injectable = this.injectable.bind(this);
    this.resolve = this.resolve.bind(this);
    this.bind = this.bind.bind(this);
    this.register = this.register.bind(this);
  }

  injectable (options: ExDepOptions) {
    return (target: ObjectAny) => {
      Reflect.defineMetadata('ex-container:options', { key: target.name, type: 'multiton', ...options }, target.prototype);
      return target;
    }
  }

  bind (ctr: any) {
    const metadata = (Reflect.getMetadata('design:paramtypes', ctr.prototype) || []).map(this.register);
    return ctr.bind(ctr, ...metadata);
  }

  resolve (ctr: any) {
    return this.register(ctr);
  }

  private register (ctr: ObjectAny) {
    const options = Reflect.getMetadata('ex-container:options', ctr.prototype) as ExDepBase|undefined;

    if (!options) {
      console.error(`Dependency is not decorated! ${JSON.stringify(ctr)}`);
    }

    if (!options || options.type === 'multiton') {
      const target = this.bind(ctr);
      return new target();
    }

    let registeredTarget = this.container.get(options.key);

    if (!registeredTarget) {
      const target = this.bind(ctr)
      registeredTarget = {
        ...options,
        ctr: target,
        instance: new target()
      }

      this.container.set(registeredTarget.key, registeredTarget);
    }
    
    return registeredTarget.instance as ObjectAny;
  }
}
