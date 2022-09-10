import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';
import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';

const _zeroPos = new /*@__PURE__*/ Vector3( 0, 0, 0 );
const _zeroQuat = new /*@__PURE__*/ Quaternion();
const _oneScale = new /*@__PURE__*/ Vector3( 1, 1, 1 );
const _identity = new /*@__PURE__*/ Matrix4();
_identity.identity();

class Camera extends Object3D {

	constructor() {

		super();

		this.type = 'Camera';

		this.matrixWorldInverse = new Matrix4();

		this.projectionMatrix = new Matrix4();
		this.projectionMatrixInverse = new Matrix4();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.matrixWorldInverse.copy( source.matrixWorldInverse );

		this.projectionMatrix.copy( source.projectionMatrix );
		this.projectionMatrixInverse.copy( source.projectionMatrixInverse );

		return this;

	}

	getWorldDirection( target ) {

		this.updateWorldMatrix( true, false );

		const e = this.matrixWorld.elements;

		return target.set( - e[ 8 ], - e[ 9 ], - e[ 10 ] ).normalize();

	}

	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		this.matrixWorldInverse.copy( this.matrixWorld ).invert();

	}

	updateWorldMatrix( updateParents, updateChildren ) {

		super.updateWorldMatrix( updateParents, updateChildren );

		this.matrixWorldInverse.copy( this.matrixWorld ).invert();

	}

	updateMatrices( forceLocalUpdate, forceWorldUpdate, skipParents ) {

		if ( ! this.hasHadFirstMatrixUpdate ) {

			if (
				! this.position.equals( _zeroPos ) ||
					! this.quaternion.equals( _zeroQuat ) ||
					! this.scale.equals( _oneScale ) ||
					! this.matrix.equals( _identity )
			) {

				// Only update the matrix the first time if its non-identity, this way
				// this.matrixIsModified will remain false until the default
				// identity matrix is updated.
				this.updateMatrix();

			}

			this.hasHadFirstMatrixUpdate = true;
			this.matrixWorldNeedsUpdate = true;
			this.matrixNeedsUpdate = false;
			this.childrenNeedMatrixWorldUpdate = false;
			this.worldMatrixConsumerFlags = 0x00;
			this.cachedMatrixWorld = this.matrixWorld;

		} else if ( this.matrixNeedsUpdate || this.matrixAutoUpdate || forceLocalUpdate ) {

			// updateMatrix() sets matrixWorldNeedsUpdate = true
			this.updateMatrix();
			if ( this.matrixNeedsUpdate ) this.matrixNeedsUpdate = false;

		}

		if ( ! skipParents && this.parent ) {

			this.parent.updateMatrices( false, forceWorldUpdate, false );
			this.matrixWorldNeedsUpdate = this.matrixWorldNeedsUpdate || this.parent.childrenNeedMatrixWorldUpdate;

		}

		if ( this.matrixWorldNeedsUpdate || forceWorldUpdate ) {

			if ( this.parent === null ) {

				this.matrixWorld.copy( this.matrix );

			} else {

				// If the matrix is unmodified, it is the identity matrix,
				// and hence we can use the parent's world matrix directly.
				//
				// Note this assumes all callers will either not pass skipParents=true
				// *or* will update the parent themselves beforehand as is done in
				// updateMatrixWorld.
				if ( ! this.matrixIsModified ) {

					this.matrixWorld = this.parent.matrixWorld;

				} else {

					// Once matrixIsModified === true, this.matrixWorld has been updated to be a local
					// copy, not a reference to this.parent.matrixWorld (see updateMatrix/applyMatrix)
					this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

				}

			}

			this.childrenNeedMatrixWorldUpdate = true;
			this.matrixWorldNeedsUpdate = false;
			this.worldMatrixConsumerFlags = 0x00;
			this.matrixWorldInverse.copy( this.matrixWorld ).invert();

		}

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

Camera.prototype.isCamera = true;

export { Camera };
