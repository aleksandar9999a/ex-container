import { ExAsyncDep } from "./interfaces";

export class ExAsyncContainer {
  private container: Map<string, ExAsyncDep>;

  constructor () {
    this.container = new Map();
    this.bind = this.bind.bind(this);
    this.resolve = this.resolve.bind(this);
  }

  bind (ctr: any) {
    return Promise.all((Reflect.getMetadata('design:paramtypes', ctr.prototype) || []).map(this.resolve))
      .then(params => {
        return ctr.bind(ctr, ...params);
      })
  }

  resolve (target: ExAsyncDep) {
    let registeredTarget = this.container.get(target.key);

    if (!registeredTarget) {
      registeredTarget = target;
      this.container.set(registeredTarget.key, registeredTarget);
    }

    if (registeredTarget.type === 'multiton') {
      return registeredTarget.import()
        .then(this.bind)
        .then(Ctr => {
          return new Ctr();
        })
    }

    if (!registeredTarget.instance) {
      return registeredTarget.import()
        .then(this.bind)
        .then(Ctr => {
          return new Ctr();
        })
        .then(instance => {
          registeredTarget!.instance = instance;
          this.container.set(registeredTarget!.key, registeredTarget!);
          return instance;
        })
    }

    return Promise.resolve(registeredTarget.instance);
  }
}
