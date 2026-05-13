export type ViolationType = 
  | 'tab_switch'
  | 'fullscreen_exit'
  | 'multiple_faces'
  | 'no_face'
  | 'background_noise'
  | 'screen_share_stopped'
  | 'camera_disabled'
  | 'camera_inactive'
  | 'camera_covered'
  | 'microphone_disabled'
  | 'copy_paste'
  | 'right_click'
  | 'keyboard_shortcut';

export interface Violation {
  type: ViolationType;
  timestamp: Date;
  description: string;
  severity: 'warning' | 'critical';
}

export default Violation;
