var Mutex = (function() {
  function Mutex() {
  }
  
  function read_lock(name) {
    return `r_${name}`;
  }
  
  function write_lock(name) {
    return `w_${name}`;
  }
  
  function create_lock(name) {
    let read_name = read_lock(name);
    let write_name = write_lock(name);
    
    if (typeof Mutex[read_name] === 'undefined') {
      Mutex[read_name] = 0;
    }
    
    if (typeof Mutex[write_name] === 'undefined') {
      Mutex[write_name] = 0;
    }
  }
  
  function await_lock(lock) {
    while (Mutex[lock] != 0) {
      true;
    }
  }
  
  function await_read_lock(name) {
    await_lock(read_lock(name));
  }
  
  function await_write_lock(name) {
    await_lock(write_lock(name));
  }
  
  function acquire_read_lock(name) {
    await_write_lock(name);
    Mutex[read_lock(name)] += 1;
  }
  
  function release_read_lock(name) {
    Mutex[read_lock(name)] -= 1;
  }
  
  function acquire_write_lock(name) {
    await_write_lock(name);
    Mutex[write_lock(name)] += 1;
    
    await_read_lock(name);
    Mutex[read_lock(name)] += 1;
  }
  
  function release_write_lock(name) {
    release_read_lock(name);
    Mutex[write_lock(name)] -= 1;
  }
  
  function with_read_lock(name, callback) {
    acquire_read_lock(name);
    callback();
    release_read_lock(name);
  }
  
  function with_write_lock(name, callback) {
    acquire_write_lock(name);
    callback();
    release_write_lock(name);
  }
  
  Mutex.prototype = {
    createLock: create_lock,
    withReadLock: with_read_lock,
    withWriteLock: with_write_lock,
  };
  
  Object.defineProperties(Mutex.prototype, {
  });
  
  return Mutex;
}());