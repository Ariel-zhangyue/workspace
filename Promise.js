const STATUS = {
  PENDING: 'pending',
  REJECTED: 'rejected',
  RESOLVED: 'resolved',
}

class MPromise {
  _status = STATUS.PENDING;
  _result = null;

  resolvedCb() { }
  rejectedCb() { }

  _resolve(res) {
    this._status = STATUS.RESOLVED;
    this.changeResult = res;
  }

  _reject(err) {
    this._status = STATUS.REJECTED;
    this.changeResult = err;
  }

  set changeResult(value) {
    console.log('#result setter', value);
    this.#result = value;
    if (this._status === STATUS.RESOLVED) {
      return this.resolvedCb(value)
    }
    return this.rejectedCb(value)
  }

  constructor(fn) {
    fn(this._resolve.bind(this), this._reject.bind(this));
  }

  then(resolvedCb, rejectedCb) {
    if (typeof resolvedCb !== 'function') { throw new Error('[Promise] first argument has to be a funciton! ') }
    this.resolvedCb = resolvedCb;
    if (typeof rejectedCb === 'function') {
      this.rejectedCb = rejectedCb;
    }
    return this;
  }

  catch(rejectedCb) {
    if (typeof rejectedCb === 'function') {
      this.rejectedCb = rejectedCb;
    }
  }

}


function timeout(ms) {
  return new MPromise((resolve, reject) => {
    setTimeout(resolve, ms, 'done');
  });
}

var a = timeout(3000);

timeout(3000)
  .then((value) => {
    console.log('----', value);
    return 'done * 2'
  })
  .then((v) => {
    console.log('++++', v);
  });