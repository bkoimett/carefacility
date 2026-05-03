## Before every release:

### Functional
- [ ] Add client form submits and appears in list
- [ ] Edit client saves changes correctly  
- [ ] Record payment updates balance on client detail
- [ ] Alert mark-as-read removes from unread count
- [ ] Discharge client changes status badge
- [ ] Delete client removes from list (with confirmation)

### Visual
- [ ] Dashboard loads without layout shift
- [ ] All 4 stat cards render with real data
- [ ] Revenue chart renders (not blank)
- [ ] Mobile sidebar opens/closes correctly
- [ ] No horizontal scroll on 375px viewport
- [ ] Forms open as modals (not full page)

### Performance  
- [ ] Dashboard initial load < 2s on localhost
- [ ] No console errors on any page
- [ ] No console warnings except React Router v7 flags (known/acceptable)

### Run before merging any UI change:
cd client && npx vite build