const STATUS = {
  PENDING: 'pending',
  REJECTED: 'rejected',
  RESOLVED: 'resolved',
}

class MPromise {
  #status = STATUS.PENDING;
  #result = null;

  resolvedCb() { }
  rejectedCb() { }

  thenRs() { }
  thenRj() { }

  _resolve(res) {
    this.#status = STATUS.RESOLVED;
    this.thenedResult = this.resolvedCb(res);
  }

  _reject(err) {
    this.#status = STATUS.REJECTED;
    this.rejectedCb(err);
  }

  set thenedResult(value) {
    this.thenRs(value)
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
    return new MPromise((resolve, reject) => {
      this.thenRs = resolve;
      this.thenRj = reject
    });
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