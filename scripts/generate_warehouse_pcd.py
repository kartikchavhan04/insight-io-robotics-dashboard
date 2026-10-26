import math
import random

def generate_warehouse():
    points = []
    
    # 1. Floor grid points (subtle LiDAR floor return)
    for x_i in range(-22, 23):
        for y_i in range(-38, 39):
            if random.random() < 0.20:
                points.append((x_i + random.gauss(0, 0.05), y_i + random.gauss(0, 0.05), random.gauss(0, 0.02), 0.2))

    # 2. Main perimeter walls
    def add_wall(x1, y1, x2, y2, height=3.2, density=18):
        length = math.hypot(x2 - x1, y2 - y1)
        steps = int(length * density)
        z_steps = int(height * 8)
        for s_idx in range(steps + 1):
            s = s_idx / max(1, steps)
            wx = x1 + (x2 - x1) * s
            wy = y1 + (y2 - y1) * s
            for z_idx in range(z_steps + 1):
                z = (z_idx / max(1, z_steps)) * height
                nx = wx + random.gauss(0, 0.04)
                ny = wy + random.gauss(0, 0.04)
                points.append((nx, ny, z, 0.85 + random.uniform(-0.1, 0.1)))

    # Outer perimeter matching reference map outline
    add_wall(-20, -35, 18, -35)
    add_wall(18, -35, 20, 10)
    add_wall(20, 10, 16, 35)
    add_wall(16, 35, -16, 35)
    add_wall(-16, 35, -20, 15)
    add_wall(-20, 15, -18, -5)
    add_wall(-18, -5, -20, -35)
    
    # Structural pillars / columns
    columns = [(-12, -20), (-12, 0), (-12, 20), (10, -20), (10, 0), (10, 20), (0, -10), (0, 15)]
    for cx, cy in columns:
        for a_idx in range(24):
            angle = (a_idx / 24.0) * 2 * math.pi
            r = 0.5 + random.gauss(0, 0.02)
            px = cx + r * math.cos(angle)
            py = cy + r * math.sin(angle)
            for z_idx in range(21):
                z = (z_idx / 20.0) * 3.5
                points.append((px, py, z, 0.95))

    # Internal partitions (Meeting Room, Lab, Workstations)
    add_wall(-15, -25, -5, -25, height=2.4)
    add_wall(-5, -25, -5, -14, height=2.4)
    add_wall(-5, -14, -15, -14, height=2.4)
    add_wall(-15, -14, -15, -25, height=2.4)

    add_wall(4, -18, 14, -18, height=2.4)
    add_wall(14, -18, 14, 15, height=2.4)
    add_wall(14, 15, 4, 15, height=2.4)
    add_wall(4, 15, 4, -18, height=2.4)

    add_wall(-12, 18, 2, 18, height=2.0)
    add_wall(-12, 24, 2, 24, height=2.0)

    pcd_path = 'public/assets/pointcloud/warehouse_slam.pcd'
    with open(pcd_path, 'w') as f:
        f.write("# .PCD v0.7 - Point Cloud Data file format\n")
        f.write("VERSION 0.7\n")
        f.write("FIELDS x y z intensity\n")
        f.write("SIZE 4 4 4 4\n")
        f.write("TYPE F F F F\n")
        f.write("COUNT 1 1 1 1\n")
        f.write(f"WIDTH {len(points)}\n")
        f.write("HEIGHT 1\n")
        f.write("VIEWPOINT 0 0 0 1 0 0 0\n")
        f.write(f"POINTS {len(points)}\n")
        f.write("DATA ascii\n")
        for x, y, z, intensity in points:
            f.write(f"{x:.4f} {y:.4f} {z:.4f} {intensity:.3f}\n")
    print(f"Generated {pcd_path} with {len(points)} points.")

if __name__ == '__main__':
    generate_warehouse()
