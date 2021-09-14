import 'reflect-metadata';

export interface DependencyConfig {
  key: string,
  type: 'multiton' | 'singleton'
}

export interface Dependency extends DependencyConfig {
  instance: ObjectAny
}

export interface DependencyOptions {
  type?: 'multiton' | 'singleton',
  key?: string
}

export interface ObjectAny {
  [key: string]: any
}

export class ExContainer {
  private container: Map<string, Dependency>;

  constructor () {
    this.container = new Map();
    this.injectable = this.injectable.bind(this);
    this.resolve = this.resolve.bind(this);
    this.register = this.register.bind(this);
  }

  injectable (options: DependencyOptions) {
    return (target: ObjectAny) => {
      Reflect.defineMetadata('ex-container:options', { key: target.name, type: 'multiton', ...options }, target.prototype);
      return target;
    }
  }

  resolve (ctr: any) {
    const metadata = (Reflect.getMetadata('design:paramtypes', ctr.prototype) || []).map(this.register);
    return new ctr(...metadata);
  }

  register (ctr: ObjectAny) {
    const options = Reflect.getMetadata('ex-container:options', ctr.prototype) as DependencyConfig|undefined;

    if (!options) {
      console.error(`Dependency is not decorated! ${JSON.stringify(ctr)}`);
      return this.resolve(ctr);
    }

    if (options.type === 'multiton') {
      return this.resolve(ctr);
    }

    let registeredTarget = this.container.get(options.key);

    if (!registeredTarget) {
      registeredTarget = {
        ...options,
        instance: this.resolve(ctr)
      }

      this.container.set(registeredTarget.key, registeredTarget);
    }
    
    return registeredTarget.instance;
  }
}
