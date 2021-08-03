const os = require("os");

const CPUs = os.cpus();
const numberOfCPUs = CPUs.length;
const fetchLoadAvg = () => {
  const [oneMinuteLoadavg] = os.loadavg();
  return {
    loadAvg: oneMinuteLoadavg / numberOfCPUs,
    timestamp: Date.now(),
  };
};

exports.fetchLoadAvg = fetchLoadAvg;
