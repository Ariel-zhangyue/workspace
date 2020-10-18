const STATUS = {
  PENDING: 'pending',
  REJECTED: 'rejected',
  RESOLVED: 'resolved',
}

class MPromise {
  #status = STATUS.PENDING;
  #result = null;

  thenRs() { }
  thenRj() { }

  _resolve(res) {
    this.#status = STATUS.RESOLVED;
    this.#result = res;
    if (typeof this.resolvedCallbcak === 'function') {
      this.resolvedCallbcak(res);
    }
  }

  _reject(err) {
    this.#status = STATUS.REJECTED;
    this.#result = err;
    if (typeof this.resolvedCallbcak === 'function') {
      this.rejectedCallbcak(err);
    }
  }

  constructor(fn) {
    fn(this._resolve.bind(this), this._reject.bind(this));
  }

  then(resolvedCb, rejectedCb) {
    if (typeof resolvedCb !== 'function') { throw new Error('[Promise then] first argument has to be a funciton! ') }
    switch (this.#status) {
      case STATUS.RESOLVED:
        return new MPromise((resolve, reject) => {
          try {
            resolve(resolvedCb(this.#result));
          } catch (error) {
            reject(error)
          }
        });
        break;
      case STATUS.REJECTED:
        return new MPromise((resolve, reject) => {
          try {
            reject(rejectedCb(this.#result))
          } catch (error) {
            reject(this.#result)
          }
        });
        break;
      default:
        return new MPromise((resolve, reject) => {
          this.resolvedCallbcak = (res) => {
            resolve(resolvedCb(res));
          }
          if (typeof rejectedCb === 'function') {
            this.rejectedCallbcak = (err) => {
              reject(rejectedCb(err));
            };
          }
        })
        break;
    }

  }

  catch(catchedCb) {
    if (typeof catchedCb !== 'function') { throw new Error('[Promise catch] argument has to be a funciton! ') }
    switch (this.#status) {
      case STATUS.REJECTED:
        if (typeof catchedCb === 'function') {
          this.catchedResult = catchedCb(this.#result)
        }
        break;
      default:
        this.rejectedCb = catchedCb;
        break;
    }
    return new MPromise((resolve, reject) => {
      this.catchRs = resolve;
      this.catchRs = reject
    });
  }

  static resolve(value) {
    return new MPromise((resolve) => { resolve(value) })
  }

  static reject(value) {
    return new MPromise((resolve, reject) => { reject(value) })
  }

  static all(promises) {
    const results = [];
    let completed = 0;
    return new MPromise((resolve, reject) => {
      promises.forEach((p, index) => {
        let pInstance = p;
        if (!(p instanceof MPromise)) {
          pInstance = Promise.resolve(p)
        }
        pInstance
          .then((v) => {
            results[index] = v;
            completed += 1;
            if (completed === promises.length) { resolve(results); }
          }).catch(err => {
            reject(err);
          })
      });
    });
  }

  static race(promises) {
    return new MPromise((resolve, reject) => {
      let processed = false;
      promises.forEach((p, index) => {
        let pInstance = p;
        if (!(p instanceof MPromise)) { pInstance = Promise.resolve(p) }
        pInstance
          .then((v) => {
            if (!processed) {
              processed = true
              resolve(v + index)
            }
          }).catch(err => {
            if (!processed) {
              processed = true
              reject(err);
            }
          })
      });
    });
  }
}

var a = new MPromise((resolve, reject) => { resolve('haha') });
a.then((v) => { console.log(v) })

var b = new MPromise((resolve, reject) => { reject('shabi') });
b.then(v => { console.log('b then:', v) }, (e) => { console.log('b catch:', e) });

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
  }, e => {
    console.log('catched', e);
  })
  .then((v) => {
    console.log('++++', v);
  })
  .catch(e => {
    console.log('catched', v);
  });


var p0 = MPromise.resolve('7');


var p1 = timeout(1000);
var p2 = timeout(5000);
var p3 = '7';
var p4 = MPromise.reject('failed')

var pa = MPromise.all([p1, p2, p3, p4]);
console.log('is pa MPromise: ', pa instanceof MPromise);

pa.then((res) => {
  const r = res.reduce((prev, crt, index) => {
    return `${prev} \n 第 ${index} ${crt} `;
  }, '')
  console.log('[MPromise.all.then]\n', r);
}).catch(err => {
  console.log('[MPromise.all.catch]\n', err);
})

var pr = MPromise.race([p1, p2, p3])
  .then((res) => {
    console.log('[MPromise.race.then]\n', res);
  })
  .catch((err) => {
    console.log('[MPromise.race.catch]\n', err);
  })