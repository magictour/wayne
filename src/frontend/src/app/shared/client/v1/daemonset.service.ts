import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import {PageState} from '../../page/page-state';
import {isNotEmpty} from '../../utils';
import {DaemonSet} from '../../model/v1/daemonset';
import {OrderItem} from '../../model/v1/order';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';

@Injectable()
export class DaemonSetService {
  headers = new HttpHeaders({'Content-type': 'application/json'});
  options = {'headers': this.headers};

  constructor(private http: HttpClient) {
  }

  getNames(appId?: number): Observable<any> {
    let params = new HttpParams();
    if (typeof(appId) === 'undefined') {
      appId = 0;
    }
    return this.http
      .get(`/api/v1/apps/${appId}/daemonsets/names`, {params: params})

      .catch(error => Observable.throw(error))
  }

  listPage(pageState: PageState, appId?: number, deleted?: string): Observable<any> {
    let params = new HttpParams();
    params = params.set('pageNo', pageState.page.pageNo + '');
    params = params.set('pageSize', pageState.page.pageSize + '');
    params = params.set('sortby', '-id');
    if (deleted) params = params.set('deleted', deleted);
    // query param
    Object.getOwnPropertyNames(pageState.params).map(key => {
      let value = pageState.params[key];
      if (isNotEmpty(value)) {
        params = params.set(key, value);
      }
    });

    let filterList: Array<string> = [];
    Object.getOwnPropertyNames(pageState.filters).map(key => {
      let value = pageState.filters[key];
      if (isNotEmpty(value)) {
        if (key === 'deleted' || key === 'id') {
          filterList.push(`${key}=${value}`)
        } else {
          filterList.push(`${key}__contains=${value}`);
        }
      }
    })
    if (filterList.length) {
      params = params.set('filter', filterList.join(','));
    }

    // sort param
    if (Object.keys(pageState.sort).length !== 0 && pageState.sort.by !== 'app.name') {
      let sortType: any = pageState.sort.reverse ? `-${pageState.sort.by}` : pageState.sort.by;
      params = params.set('sortby', sortType);
    }

    return this.http
      .get(`/api/v1/apps/${appId}/daemonsets`, {params: params})

      .catch(error => Observable.throw(error))
  }

  create(obj: DaemonSet): Observable<any> {
    return this.http
      .post(`/api/v1/apps/${obj.appId}/daemonsets`, obj)

      .catch(error => Observable.throw(error));
  }

  update(obj: DaemonSet): Observable<any> {
    return this.http
      .put(`/api/v1/apps/${obj.appId}/daemonsets/${obj.id}`, obj, this.options)

      .catch(error => Observable.throw(error));
  }

  updateOrder(appId: number, orderList: Array<OrderItem>): Observable<any> {
    return this.http
      .put(`/api/v1/apps/${appId}/daemonsets/updateorders`, orderList, this.options)

      .catch(error => Observable.throw(error));
  } 

  deleteById(id: number, appId: number, logical?: boolean): Observable<any> {
    let options : any = {};
    if (logical != null) {
      let params = new HttpParams();
      params = params.set('logical', logical + '');
      options.params = params
    }

    return this.http
      .delete(`/api/v1/apps/${appId}/daemonsets/${id}`, options)

      .catch(error => Observable.throw(error));
  }

  getById(id: number, appId: number): Observable<any> {
    return this.http
      .get(`/api/v1/apps/${appId}/daemonsets/${id}`)

      .catch(error => Observable.throw(error));
  }
}
