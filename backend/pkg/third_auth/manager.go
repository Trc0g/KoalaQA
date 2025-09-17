package third_auth

import (
	"context"
	"errors"
	"sync"

	"github.com/chaitin/koalaqa/model"
)

type Manager struct {
	lock    sync.Mutex
	authors map[model.AuthType]Author
}

func (m *Manager) author(t model.AuthType) (Author, bool) {
	m.lock.Lock()
	author, ok := m.authors[t]
	m.lock.Unlock()
	return author, ok
}

func (m *Manager) updateAuthor(t model.AuthType, author Author) {
	m.lock.Lock()
	m.authors[t] = author
	m.lock.Unlock()
}

func (m *Manager) Update(t model.AuthType, cfg Config, checkCfg bool) error {
	var author Author
	switch t {
	case model.AuthTypeOIDC:
		author = newOIDC(cfg)
	default:
		return errors.ErrUnsupported
	}

	if checkCfg {
		err := author.Check(context.Background())
		if err != nil {
			return err
		}
	}

	m.updateAuthor(t, author)

	return nil
}

func (m *Manager) AuthURL(ctx context.Context, t model.AuthType) (string, error) {
	author, ok := m.author(t)
	if !ok {
		return "", errors.ErrUnsupported
	}

	return author.AuthURL(ctx)
}

func (o *Manager) User(ctx context.Context, t model.AuthType, code string, optFuncs ...userOptFunc) (*User, error) {
	author, ok := o.author(t)
	if !ok {
		return nil, errors.ErrUnsupported
	}

	return author.User(ctx, code, optFuncs...)
}

func newManager() *Manager {
	return &Manager{
		authors: make(map[model.AuthType]Author),
	}
}
