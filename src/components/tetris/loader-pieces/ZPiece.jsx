import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import './styles.css';

const ZPiece = forwardRef(({ className }, ref) => (
  <div ref={ref} className={`zPiece ${className}`}>
    <div />
    <div />
  </div>
));

ZPiece.displayName = 'ZPiece';
export default motion.create(ZPiece);
