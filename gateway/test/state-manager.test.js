import { afterEach, beforeEach, expect, jest, test } from '@jest/globals';
import mock from 'mock-fs';
import * as fs from 'fs';
import path from 'path';
import { State, StateManager } from '../state-manager';
import axios from 'axios';
import compose from 'docker-compose';

describe('state-manager', () => {
  test('state-manager should create state file if it does not exist', async () => {
    mock({
      '/logs': {},
    });
    expect(fs.existsSync(path.join('/logs', 'state.current'))).toBe(false);
    StateManager.getState();
    expect(fs.existsSync(path.join('/logs', 'state.current'))).toBe(true);
    mock.restore();
  });

  test('state-manager should create state-log file if it does not exist', async () => {
    mock({
      '/logs': {},
    });
    expect(fs.existsSync(path.join('/logs', 'state.log'))).toBe(false);
    StateManager.getStateLog();
    expect(fs.existsSync(path.join('/logs', 'state.log'))).toBe(true);
    mock.restore();
  });

  test('state-manager should not change state if pausing fails', async () => {
    mock({
      '/logs/state.current': Buffer.from(State.RUNNING),
    });
    // since we are using axios to request data
    // this may not be a good idea as changing implementation breaks tests
    // or in worst case, provides a false image of everything good
    const mockedResponse = {
      status: 500,
    };
    axios.post = jest.fn();
    axios.post.mockResolvedValue(mockedResponse);
    expect(StateManager.getState()).toBe(State.RUNNING);
    await StateManager.setState(State.PAUSED);
    expect(StateManager.getState()).toBe(State.RUNNING);
    mock.restore();
  });

  test('state-manager should not change state if running fails', async () => {
    mock({
      '/logs/state.current': Buffer.from(State.PAUSED),
    });
    // since we are using axios to request data
    // this may not be a good idea as changing implementation breaks tests
    // or in worst case, provides a false image of everything good
    const mockedResponse = {
      status: 500,
    };
    axios.post = jest.fn();
    axios.post.mockResolvedValue(mockedResponse);
    expect(StateManager.getState()).toBe(State.PAUSED);
    await StateManager.setState(State.RUNNING);
    expect(StateManager.getState()).toBe(State.PAUSED);
    mock.restore();
  });

  test('state-manager should be running after paused', async () => {
    mock({
      '/logs/state.current': Buffer.from(State.PAUSED),
    });
    // since we are using axios to request data
    // this may not be a good idea as changing implementation breaks tests
    // or in worst case, provides a false image of everything good
    // jest.useFakeTimers();
    const mockedResponse = {
      status: 204,
    };
    axios.post = jest.fn();
    axios.post.mockResolvedValue(mockedResponse);
    expect(StateManager.getState()).toBe(State.PAUSED);
    await StateManager.setState(State.RUNNING);
    expect(StateManager.getState()).toBe(State.RUNNING);
    mock.restore();
  });

  test('state-manager should be running after init', async () => {
    mock({
      '/logs/state.current': Buffer.from(State.SHUTDOWN),
    });
    compose.upAll = jest.fn();
    // since we are using axios to request data
    // this may not be a good idea as changing implementation breaks tests
    // or in worst case, provides a false image of everything good
    const mockedResponse = {
      status: 204,
    };
    axios.post = jest.fn();
    axios.post.mockResolvedValue(mockedResponse);
    expect(StateManager.getState()).toBe(State.SHUTDOWN);
    await StateManager.setState(State.INIT);
    await new Promise(r => setTimeout(r, 1100));
    expect(StateManager.getState()).toBe(State.RUNNING);
    mock.restore();
  });

  test('state-manager should not change state if init fails', async () => {
    mock({
      '/logs/state.current': Buffer.from(State.SHUTDOWN),
    });
    compose.upAll = jest.fn();
    compose.upAll.mockRejectedValue(new Error('Mocked Error'));
    compose.down = jest.fn();
    expect(StateManager.getState()).toBe(State.SHUTDOWN);
    await StateManager.setState(State.INIT);
    await new Promise(r => setTimeout(r, 1100));
    expect(StateManager.getState()).toBe(State.SHUTDOWN);
    mock.restore();
  });
});
