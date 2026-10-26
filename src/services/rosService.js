/**
 * ROSBridge WebSocket Client for Insight.IO
 * Native WebSocket implementation of the rosbridge protocol v2.0
 * Compatible with ROS 1 (rosbridge_suite) & ROS 2 (ros2-web-bridge)
 */

class RosService {
  constructor() {
    this.ws = null;
    this.status = 'DISCONNECTED'; // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'
    this.url = 'ws://localhost:9090';
    this.statusSubscribers = new Set();
    this.messageSubscribers = new Map(); // topic -> Set(callbacks)
  }

  subscribeStatus(listener) {
    this.statusSubscribers.add(listener);
    listener(this.status);
    return () => this.statusSubscribers.delete(listener);
  }

  notifyStatus(newStatus) {
    this.status = newStatus;
    for (const listener of this.statusSubscribers) {
      try {
        listener(this.status);
      } catch (err) {
        console.error('RosService status listener error:', err);
      }
    }
  }

  connect(url = 'ws://localhost:9090') {
    this.url = url;
    if (this.ws) {
      this.disconnect();
    }

    this.notifyStatus('CONNECTING');

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.notifyStatus('CONNECTED');
        // Auto-subscribe to standard ROS telemetry topics
        this.subscribeTopic('/odom', 'nav_msgs/Odometry');
        this.subscribeTopic('/battery_state', 'sensor_msgs/BatteryState');
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.op === 'publish' && msg.topic) {
            const listeners = this.messageSubscribers.get(msg.topic);
            if (listeners) {
              for (const cb of listeners) {
                cb(msg.msg);
              }
            }
          }
        } catch {
          // ignore malformed packets
        }
      };

      this.ws.onerror = () => {
        this.notifyStatus('ERROR');
      };

      this.ws.onclose = () => {
        this.notifyStatus('DISCONNECTED');
      };
    } catch {
      this.notifyStatus('ERROR');
    }
  }

  disconnect() {
    if (this.ws) {
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }
    this.notifyStatus('DISCONNECTED');
  }

  subscribeTopic(topic, type, callback) {
    if (callback) {
      if (!this.messageSubscribers.has(topic)) {
        this.messageSubscribers.set(topic, new Set());
      }
      this.messageSubscribers.get(topic).add(callback);
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          op: 'subscribe',
          topic,
          type
        })
      );
    }

    return () => {
      if (callback && this.messageSubscribers.has(topic)) {
        this.messageSubscribers.get(topic).delete(callback);
      }
    };
  }

  publishCmdVel(linearX, angularZ) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const payload = {
      op: 'publish',
      topic: '/cmd_vel',
      msg: {
        linear: { x: linearX, y: 0.0, z: 0.0 },
        angular: { x: 0.0, y: 0.0, z: angularZ }
      }
    };

    try {
      this.ws.send(JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to send ROS /cmd_vel message:', err);
    }
  }
}

export const rosService = new RosService();

