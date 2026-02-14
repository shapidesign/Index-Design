import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import './styles.css';

const LPiece = forwardRef(({ className }, ref) => (
  <div ref={ref} className={`lPiece ${className}`}>
    <div />
    <div />
  </div>
));

LPiece.displayName = 'LPiece';
export default motion.create(LPiece);
