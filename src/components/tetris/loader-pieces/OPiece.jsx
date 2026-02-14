import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import './styles.css';

const OPiece = forwardRef(({ className }, ref) => (
  <div ref={ref} className={`oPiece ${className}`}>
    <div />
  </div>
));

OPiece.displayName = 'OPiece';
export default motion.create(OPiece);
