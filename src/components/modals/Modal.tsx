import { Dialog, Transition } from '@headlessui/react'
import { Fragment, type ReactNode } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses: Record<Required<ModalProps>['size'], string> = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
}

export const Modal = ({ open, onClose, title, description, children, size = 'md' }: ModalProps) => {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`w-full transform overflow-hidden rounded-2xl border border-white/10 bg-slate-950 text-left align-middle shadow-xl transition-all ${sizeClasses[size]}`}>
                <div className="flex items-start justify-between border-b border-white/10 p-6">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-white">{title}</Dialog.Title>
                    {description ? <Dialog.Description className="mt-1 text-sm text-slate-400">{description}</Dialog.Description> : null}
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5" aria-hidden />
                    <span className="sr-only">Close</span>
                  </button>
                </div>
                <div className="p-6">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

