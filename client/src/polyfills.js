import process from 'process';
import { Buffer } from 'buffer';

// Polyfill process
window.process = process;

// Polyfill Buffer
window.Buffer = Buffer;
